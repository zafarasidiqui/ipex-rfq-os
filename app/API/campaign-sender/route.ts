// FILE: app/api/campaign-sender/route.ts
// PURPOSE: Reads project from Supabase, sends bulk supplier enquiry emails via Gmail SMTP
// REQUIRES in .env.local:
//   GMAIL_USER=info@ipexgmbh.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← 16-char Gmail App Password
// INSTALL: npm install nodemailer xlsx @types/nodemailer

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Gmail SMTP via App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const maxDuration = 300; // 5 minutes — Vercel Pro allows up to 300s

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const file      = formData.get('file') as File;
    const projectCode = (formData.get('project_code') as string)?.trim().toUpperCase();
    const previewOnly = formData.get('preview') === 'true';

    if (!file || !projectCode) {
      return NextResponse.json({ error: 'Missing file or project code.' }, { status: 400 });
    }

    // ── 1. Load project details from Supabase ────────────────────────────────
    const { data: project, error: projErr } = await supabase
      .from('rfq_projects')
      .select('*')
      .or(`project_code.eq.${projectCode},internal_code.ilike.${projectCode}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: `Project "${projectCode}" not found in system.` }, { status: 404 });
    }

    // ── 2. Parse Excel email list ────────────────────────────────────────────
    const buffer    = await file.arrayBuffer();
    const workbook  = XLSX.read(buffer, { type: 'array' });
    const sheet     = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Detect columns — support single column (email) or two columns (name, email)
    const emails: { name: string; email: string }[] = [];
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const row of rows) {
      if (!row || row.length === 0) continue;

      let email = '';
      let name  = '';

      if (row.length === 1) {
        // Single column
        email = String(row[0]).trim().toLowerCase();
      } else {
        // Two or more columns — find which has the email
        const col0 = String(row[0]).trim();
        const col1 = String(row[1]).trim();
        if (EMAIL_REGEX.test(col1)) {
          name  = col0;
          email = col1.toLowerCase();
        } else if (EMAIL_REGEX.test(col0)) {
          email = col0.toLowerCase();
          name  = col1;
        }
      }

      if (EMAIL_REGEX.test(email)) {
        emails.push({ name, email });
      }
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found in file.' }, { status: 400 });
    }

    // ── 3. Build subject and body ────────────────────────────────────────────
    const manufacturer  = project.manufacturer || project.brand || '';
    const product       = project.product_description || project.description || '';
    const partNo        = project.part_number || project.part_no || '';
    const qty           = project.quantity || project.qty || '';

    // Subject — never use word "RFQ"
    const subject = `Enquiry No. ${projectCode} | ${manufacturer} | ${product}`.substring(0, 200);

    // Email body template
    const bodyTemplate = (recipientName: string) => `Dear ${recipientName || 'Sir/Madam'},

We are IPEX Industrial Projects Export GmbH, a German trading company sourcing industrial equipment and components for our clients in Pakistan and the GCC region.

We have a requirement for the following and would appreciate your best offer:

Product    : ${product}
Manufacturer: ${manufacturer}
Part No    : ${partNo}
Quantity   : ${qty}

Please quote your best price, available stock, lead time, and payment terms.

Kindly reply to this email referencing: ${subject}

We look forward to your valued offer.

Best regards,

IPEX Industrial Projects Export GmbH
info@ipexgmbh.com
www.ipexgmbh.com`;

    // ── 4. Preview mode — return details without sending ─────────────────────
    if (previewOnly) {
      return NextResponse.json({
        project_code:  projectCode,
        manufacturer,
        product,
        part_no:       partNo,
        quantity:      qty,
        subject,
        body_preview:  bodyTemplate('Sir/Madam'),
        recipient_count: emails.length,
        first_5:       emails.slice(0, 5),
      });
    }

    // ── 5. Send emails ───────────────────────────────────────────────────────
    const results = { sent: 0, failed: 0, errors: [] as string[] };
    const logRows: any[] = [];

    for (const recipient of emails) {
      const body = bodyTemplate(recipient.name);
      try {
        await transporter.sendMail({
          from:    `"IPEX Industrial Projects Export" <${process.env.GMAIL_USER}>`,
          to:      recipient.email,
          subject,
          text:    body,
          replyTo: process.env.GMAIL_USER,
        });

        results.sent++;
        logRows.push({
          project_code:   projectCode,
          supplier_email: recipient.email,
          supplier_name:  recipient.name || null,
          subject_line:   subject,
          status:         'SENT',
        });
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${recipient.email}: ${err.message}`);
        logRows.push({
          project_code:   projectCode,
          supplier_email: recipient.email,
          supplier_name:  recipient.name || null,
          subject_line:   subject,
          status:         'FAILED',
          error_message:  err.message?.substring(0, 200),
        });
      }

      // 300ms delay between emails — avoids Gmail rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    // ── 6. Log all results to Supabase ───────────────────────────────────────
    if (logRows.length > 0) {
      await supabase.from('campaign_sends').insert(logRows);
    }

    return NextResponse.json({
      project_code: projectCode,
      subject,
      total:        emails.length,
      sent:         results.sent,
      failed:       results.failed,
      errors:       results.errors.slice(0, 10), // Return first 10 errors only
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
