'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function generateProjectCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const rand = (n: number) => Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('')
  return `${rand(4)}-${rand(3)}-${rand(2)}`
}

function getInternalCode(code: string): string {
  const now = new Date()
  const pad = (n: number, d = 2) => String(n).padStart(d, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${code}-${date}-${time}`
}

export default function NewProjectPage() {
  const router = useRouter()

  const [projectCode, setProjectCode] = useState('')
  const [companies, setCompanies] = useState<{ company_id: string; company_name: string }[]>([])
  const [form, setForm] = useState({
    company_id: '',
    contact_name: '',
    contact_email: '',
    subject: '',
    product_description: '',
    manufacturer: '',
    part_no: '',
    quantity: '',
    currency: 'USD',
    source: 'EMAIL',
    priority: 'NORMAL',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setProjectCode(generateProjectCode())
    supabase.from('companies').select('company_id, company_name').order('company_name').then(({ data }) => {
      if (data) setCompanies(data)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.company_id || !form.product_description) {
      setError('Company and Product Description are required.')
      return
    }
    setSaving(true)
    const internal_code = getInternalCode(projectCode)
    const enquiry_subject = `Enquiry No. ${projectCode} | ${form.manufacturer || 'TBC'} | ${form.product_description.substring(0, 60)}`

    const { error: err } = await supabase.from('rfq_projects').insert({
      project_code: projectCode,
      internal_code,
      company_id: form.company_id,
      contact_name: form.contact_name,
      contact_email: form.contact_email.toLowerCase().trim(),
      subject: enquiry_subject,
      product_description: form.product_description,
      manufacturer: form.manufacturer,
      part_no: form.part_no,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      currency: form.currency,
      source: form.source,
      priority: form.priority,
      notes: form.notes,
      status: 'NEW',
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(`Project created — ${projectCode}`)
    setTimeout(() => router.push('/dashboard/projects'), 1500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '12px' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Project</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Create a new RFQ project</p>
      </div>

      {/* Project Code */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Project Code</div>
          <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.15em' }}>
            {projectCode}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Internal: {projectCode ? getInternalCode(projectCode) : '—'}
          </div>
        </div>
        <button
          onClick={() => setProjectCode(generateProjectCode())}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 14px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ↻ Regenerate
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Company + Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Company *">
            <select name="company_id" value={form.company_id} onChange={handleChange}>
              <option value="">— Select Company —</option>
              {companies.map(c => (
                <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select name="source" value={form.source} onChange={handleChange}>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE">Phone</option>
              <option value="VERBAL">Verbal</option>
              <option value="CAMPAIGN">Campaign Lead</option>
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Contact Name">
            <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Person who sent the RFQ" />
          </Field>
          <Field label="Contact Email">
            <input name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="contact@company.com" />
          </Field>
        </div>

        {/* Product */}
        <Field label="Product Description *">
          <input name="product_description" value={form.product_description} onChange={handleChange} placeholder="Full product name as received from customer" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Manufacturer / Brand">
            <input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Merck, Siemens" />
          </Field>
          <Field label="Part Number">
            <input name="part_no" value={form.part_no} onChange={handleChange} placeholder="e.g. 1.06404.1000" />
          </Field>
          <Field label="Quantity">
            <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="1" type="number" />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Currency">
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="PKR">PKR</option>
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="NORMAL">Normal</option>
              <option value="URGENT">Urgent</option>
              <option value="LOW">Low</option>
            </select>
          </Field>
        </div>

        {/* Enquiry subject preview */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-Generated Email Subject</div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            Enquiry No. {projectCode} | {form.manufacturer || 'TBC'} | {form.product_description.substring(0, 50) || '...'}
          </div>
        </div>

        <Field label="Notes">
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Internal notes, special requirements..." rows={3} />
        </Field>
      </div>

      <div style={{ marginTop: '28px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 28px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Create Project'}
        </button>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        {error && <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>}
        {success && <span style={{ color: '#4ade80', fontSize: '13px' }}>{success}</span>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      <style jsx global>{`
        input, select, textarea {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 9px 12px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--accent); }
        select option { background: #1a1a2e; }
        textarea { resize: vertical; }
      `}</style>
    </div>
  )
}
