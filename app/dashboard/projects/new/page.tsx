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
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${code}-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const UNITS = ['KG', 'MT', 'LT', 'AM.TON', 'LBS', 'Meters', 'Feet', 'Liters', 'Numbers', 'Pcs', 'Sets', 'Bags', 'Drums', 'Cartons']

export default function NewProjectPage() {
  const router = useRouter()
  const [projectCode, setProjectCode] = useState('')
  const [companies, setCompanies] = useState<{ company_id: string; company_name: string }[]>([])
  const [form, setForm] = useState({
    company_id: '', contact_name: '', contact_email: '',
    product_description: '', manufacturer: '', part_no: '',
    quantity: '', unit: 'KG', currency: 'USD', source: 'EMAIL', priority: 'NORMAL', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setProjectCode(generateProjectCode())
    supabase.from('companies').select('company_id, company_name').order('company_name').then(({ data }) => { if (data) setCompanies(data) })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.company_id || !form.product_description) { setError('Company and Product Description are required.'); return }
    setSaving(true)
    const internal_code = getInternalCode(projectCode)
    const enquiry_subject = `Enquiry No. ${projectCode} | ${form.manufacturer || 'TBC'} | ${form.product_description.substring(0, 60)}`
    const { error: err } = await supabase.from('rfq_projects').insert({
      project_code: projectCode, internal_code, company_id: form.company_id,
      contact_name: form.contact_name, contact_email: form.contact_email.toLowerCase().trim(),
      subject: enquiry_subject, product_description: form.product_description,
      manufacturer: form.manufacturer, part_no: form.part_no,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      currency: form.currency, source: form.source, priority: form.priority,
      notes: form.notes, status: 'NEW',
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(`Project created — ${projectCode}`)
    setTimeout(() => router.push('/dashboard/projects'), 1500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <button onClick={() => router.back()} style={backBtn}>← Back</button>

      <div style={pageHeader('#3b82f6')}>
        <div style={headerBadge('#3b82f6')}>PROJECTS</div>
        <h1 style={pageTitle}>New Project</h1>
        <p style={pageSubtitle}>Create a new RFQ project with auto-generated code</p>
      </div>

      <div style={codeBox('#3b82f6')}>
        <div>
          <div style={idLabel}>PROJECT CODE</div>
          <div style={{ ...idValue, color: '#60a5fa', letterSpacing: '0.18em' }}>{projectCode}</div>
          <div style={idHint}>Internal: {projectCode ? getInternalCode(projectCode) : '—'}</div>
        </div>
        <button onClick={() => setProjectCode(generateProjectCode())} style={regenBtn}>↻ Regenerate</button>
      </div>

      <div style={formCard('#1a2235')}>
        <div style={sectionTitle('#3b82f6')}>Customer & Source</div>
        <div style={row2}>
          <Field label="Company *"><select name="company_id" value={form.company_id} onChange={handleChange} style={inp}><option value="">— Select Company —</option>{companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}</select></Field>
          <Field label="Source"><select name="source" value={form.source} onChange={handleChange} style={inp}><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option><option value="PHONE">Phone</option><option value="VERBAL">Verbal</option><option value="CAMPAIGN">Campaign Lead</option></select></Field>
        </div>
        <div style={{ ...row2, marginTop: '16px' }}>
          <Field label="Contact Name"><input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Person who sent the RFQ" style={inp} /></Field>
          <Field label="Contact Email"><input name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="contact@company.com" style={inp} /></Field>
        </div>
      </div>

      <div style={formCard('#1a2a1e')}>
        <div style={sectionTitle('#22c55e')}>Product Details</div>
        <Field label="Product Description *"><input name="product_description" value={form.product_description} onChange={handleChange} placeholder="Full product name as received from customer" style={inp} /></Field>
        <div style={{ ...row3, marginTop: '16px' }}>
          <Field label="Manufacturer / Brand"><input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Merck, Siemens" style={inp} /></Field>
          <Field label="Part Number"><input name="part_no" value={form.part_no} onChange={handleChange} placeholder="e.g. 1.06404.1000" style={inp} /></Field>
          <Field label="Currency"><select name="currency" value={form.currency} onChange={handleChange} style={inp}><option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option></select></Field>
        </div>
        <div style={{ ...row2, marginTop: '16px' }}>
          <Field label="Quantity">
            <div style={{ display: 'flex', gap: '8px' }}>
              <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="50" type="number" style={{ ...inp, flex: 1 }} />
              <select name="unit" value={form.unit} onChange={handleChange} style={{ ...inp, width: '120px', flex: 'none' }}>{UNITS.map(u => <option key={u}>{u}</option>)}</select>
            </div>
          </Field>
          <Field label="Priority"><select name="priority" value={form.priority} onChange={handleChange} style={inp}><option value="NORMAL">Normal</option><option value="URGENT">Urgent</option><option value="LOW">Low</option></select></Field>
        </div>
      </div>

      <div style={{ ...formCard('#1e1a2a'), marginBottom: '8px' }}>
        <div style={sectionTitle('#a78bfa')}>Email Subject Preview</div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#e8ecf4', padding: '10px 0' }}>
          Enquiry No. {projectCode} | {form.manufacturer || 'TBC'} | {form.product_description.substring(0, 50) || '...'}
        </div>
      </div>

      <div style={formCard('#1a1f2e')}>
        <Field label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' as const }} placeholder="Internal notes..." /></Field>
      </div>

      <div style={actions}>
        <button onClick={handleSave} disabled={saving} style={saveBtn('#3b82f6')}>{saving ? 'Saving...' : 'Create Project'}</button>
        <button onClick={() => router.back()} style={cancelBtn}>Cancel</button>
        {error && <span style={errTxt}>{error}</span>}
        {success && <span style={okTxt}>{success}</span>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={lbl}>{label}</label>{children}</div>
}

const backBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#525d6e', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '20px', display: 'block' }
const pageTitle: React.CSSProperties = { fontSize: '24px', fontWeight: 700, color: '#e8ecf4', margin: '8px 0 4px' }
const pageSubtitle: React.CSSProperties = { color: '#6b7280', fontSize: '13px' }
const idLabel: React.CSSProperties = { fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '6px' }
const idHint: React.CSSProperties = { fontSize: '11px', color: '#4b5563', marginTop: '4px' }
const idValue: React.CSSProperties = { fontFamily: 'monospace', fontSize: '20px', fontWeight: 700, letterSpacing: '0.12em' }
const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }
const row3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }
const actions: React.CSSProperties = { marginTop: '28px', display: 'flex', gap: '12px', alignItems: 'center' }
const errTxt: React.CSSProperties = { color: '#f87171', fontSize: '13px' }
const okTxt: React.CSSProperties = { color: '#4ade80', fontSize: '13px' }
const cancelBtn: React.CSSProperties = { background: 'none', border: '1px solid #2d3f55', color: '#6b7280', borderRadius: '6px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }
const regenBtn: React.CSSProperties = { background: 'none', border: '1px solid #2d3f55', color: '#6b7280', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 500 }
const inp: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #2d3f55', borderRadius: '6px', padding: '9px 12px', color: '#e8ecf4', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }

function pageHeader(color: string): React.CSSProperties { return { borderLeft: `4px solid ${color}`, paddingLeft: '16px', marginBottom: '24px' } }
function headerBadge(color: string): React.CSSProperties { return { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', background: `${color}22`, color, marginBottom: '8px', fontFamily: 'monospace' } }
function formCard(bg: string): React.CSSProperties { return { background: bg, border: '1px solid #2d3f55', borderRadius: '10px', padding: '20px', marginBottom: '16px', display: 'grid', gap: '16px' } }
function sectionTitle(color: string): React.CSSProperties { return { fontSize: '11px', fontWeight: 600, color, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '-4px' } }
function idBox(color: string): React.CSSProperties { return { background: `${color}11`, border: `1px solid ${color}44`, borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' } }
function codeBox(color: string): React.CSSProperties { return { background: `${color}11`, border: `1px solid ${color}44`, borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }
function saveBtn(color: string): React.CSSProperties { return { background: color, color: color === '#22c55e' ? '#0f172a' : '#fff', border: 'none', borderRadius: '6px', padding: '10px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' } }

function InfoCell({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '13px', fontWeight: highlight ? 700 : 500, color: highlight ? '#3b82f6' : '#e8ecf4' }}>{value}</div>
    </div>
  )
}
