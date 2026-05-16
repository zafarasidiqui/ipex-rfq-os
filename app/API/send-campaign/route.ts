import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { projectCode, emails, subject, body } = await req.json()

    if (!projectCode || !emails || emails.length === 0) {
      return NextResponse.json({ error: 'Missing project code or emails' }, { status: 400 })
    }

    const results: { email: string; status: string }[] = []

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `IPEX Industrial Projects Export GmbH <${process.env.SMTP_USER}>`,
          to: email,
          subject,
          text: body,
        })

        await supabase.from('campaign_sends').insert({
          project_code: projectCode,
          recipient_email: email,
          subject,
          status: 'SENT',
          sent_at: new Date().toISOString(),
        })

        results.push({ email, status: 'SENT' })
      } catch {
        results.push({ email, status: 'FAILED' })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
