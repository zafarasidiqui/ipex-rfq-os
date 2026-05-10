'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MARGIN_STEPS = [50, 40, 30, 20, 10]

interface Project {
  project_code: string
  product_description: string
  manufacturer: string
  company_id: string
  companies?: { company_name: string }
  margin_step?: number
}

interface FXRate { currency: string; rate_pkr: number; rate_date: string }

export default function NewQuotationPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [fxRates, setFxRates] = useState<FXRate[]>([])
  const [form, setForm] = useState({
    project_code: '', unit_price: '', currency: 'USD', quantity: '1',
    validity_days: '30', payment_terms: '100% Advance',
    delivery_days: '', incoterms: 'CIF Karachi', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase.from('rfq_projects').select('project_code, product_description, manufacturer, company_id, companies(company_name), margin_step').in('status', ['NEW', 'IN_PROGRESS', 'QUOTED']).order('created_at', { ascending: false }).then(({ data }) => { if (data) setProjects(data as unknown as Project[]) })
    supabase.from('fx_rates').select('currency, rate_pkr, rate_date').then(({ data }) => { if (data) setFxRates(data) })
  }, [])

  const selectedProject = projects.find(p => p.project_code === form.project_code)
  const marginStep = selectedProject?.margin_step ?? 0
  const currentMarginPct = MARGIN_STEPS[Math.min(marginStep, MARGIN_STEPS.length - 1)]
  const fxRate = fxRates.find(r => r.currency === form.currency)
  const unitPrice = parseFloat(form.unit_price) || 0
  const qty = parseInt(form.quantity) || 1
  const totalForeign = unitPrice * qty
  const totalPKR = fxRate ? totalForeign * fxRate.rate_pkr : 0
  const sellingPricePKR = totalPKR * (1 + currentMarginPct / 100)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.project_code || !form.unit_price) { setError('Project and Unit Price are required.'); return }
    setSaving(true)
    const now = new Date()
    const quote_date = now.toISOString().split('T')[0]
    const { error: err } = await supabase.from('quotations').insert({
      project_code: form.project_code, company_id: selectedProject?.company_id,
      quote_date, fx_date_frozen: fxRate?.rate_date || quote_date,
      currency: form.currency, fx_rate_pkr: fxRate?.rate_pkr || null,
      unit_price: unitPrice, quantity: qty, total_foreign: totalForeign,
      total_pkr: totalPKR, margin_pct: currentMarginPct,
      margin_amount_pkr: totalPKR * (currentMarginPct / 100),
      selling_price_pkr: sellingPricePKR,
      validity_days: parseInt(form.validity_days),
      payment_terms: form.payment_terms,
      delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
      incoterms: form.incoterms, notes: form.notes, status: 'DRAFT',
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess('Quotation saved as DRAFT')
    setTimeout(() => router.push('/dashboard/quotations'), 1500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <button onClick={() => router.back()} style={backBtn}>← Back</button>

      <div style={pageHeader('#22c55e')}>
        <div style={headerBadge('#22c55e')}>QUOTATIONS</div>
        <h1 style={pageTitle}>New Quotation</h1>
        <p style={pageSubtitle}>FX rates frozen at today — margin auto-calculated</p>
      </div>

      <div style={formCard('#1a2235')}>
        <div style={sectionTitle('#3b82f6')}>Select Project</div>
        <Field label="Project *"><select name="project_code" value={form.project_code} onChange={handleChange} style={inp}><option value="">— Select Project —</option>{projects.map(p => <option key={p.project_code} value={p.project_code}>{p.project_code} | {(p.companies as any)?.company_name || p.company_id} | {p.product_description?.substring(0, 40)}</option>)}</select></Field>
        {selectedProject && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '16px' }}>
            <InfoCell label="Project" value={selectedProject.project_code} mono />
            <InfoCell label="Manufacturer" value={selectedProject.manufacturer || '—'} />
            <InfoCell label="Product" value={selectedProject.product_description?.substring(0, 40) || '—'} />
          </div>
        )}
      </div>

      <div style={formCard('#1a2a1e')}>
        <div style={sectionTitle('#22c55e')}>Pricing</div>
        <div style={row3}>
          <Field label="Unit Price *"><input name="unit_price" value={form.unit_price} onChange={handleChange} placeholder="0.00" type="number" step="0.01" style={inp} /></Field>
          <Field label="Currency"><select name="currency" value={form.currency} onChange={handleChange} style={inp}><option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option></select></Field>
          <Field label="Quantity"><input name="quantity" value={form.quantity} onChange={handleChange} type="number" style={inp} /></Field>
        </div>

        <div style={{ background: '#0f2a1a', border: '1px solid #166534', borderRadius: '8px', padding: '16px', marginTop: '20px' }}>
          <div style={{ fontSize: '11px', color: '#86efac', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '12px' }}>
            Margin Engine — Step {marginStep + 1} / 5 — {currentMarginPct}% margin applied
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {MARGIN_STEPS.map((pct, i) => (
              <div key={i} style={{ flex: 1, padding: '6px', borderRadius: '4px', textAlign: 'center' as const, fontSize: '12px', fontWeight: 600, background: i === marginStep ? '#22c55e' : '#1a2a1e', color: i === marginStep ? '#0f172a' : i < marginStep ? '#f87171' : '#4b5563', border: `1px solid ${i === marginStep ? '#22c55e' : '#253047'}` }}>{pct}%</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            <InfoCell label={`Total (${form.currency})`} value={totalForeign ? totalForeign.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'} mono />
            <InfoCell label="FX Rate (PKR)" value={fxRate ? fxRate.rate_pkr.toFixed(2) : 'Not in DB'} mono />
            <InfoCell label="Cost (PKR)" value={totalPKR ? `PKR ${Math.round(totalPKR).toLocaleString()}` : '—'} mono />
            <InfoCell label={`Sell Price +${currentMarginPct}%`} value={sellingPricePKR ? `PKR ${Math.round(sellingPricePKR).toLocaleString()}` : '—'} mono highlight />
          </div>
        </div>
      </div>

      <div style={formCard('#1e1a2a')}>
        <div style={sectionTitle('#a78bfa')}>Terms</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          <Field label="Validity (days)"><input name="validity_days" value={form.validity_days} onChange={handleChange} type="number" style={inp} /></Field>
          <Field label="Payment Terms"><input name="payment_terms" value={form.payment_terms} onChange={handleChange} style={inp} /></Field>
          <Field label="Delivery (days)"><input name="delivery_days" value={form.delivery_days} onChange={handleChange} type="number" style={inp} /></Field>
          <Field label="Incoterms"><select name="incoterms" value={form.incoterms} onChange={handleChange} style={inp}><option>CIF Karachi</option><option>FOB Origin</option><option>EXW</option><option>DAP Karachi</option><option>DDP Karachi</option></select></Field>
        </div>
        <div style={{ marginTop: '16px' }}>
          <Field label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></Field>
        </div>
      </div>

      <div style={actions}>
        <button onClick={handleSave} disabled={saving} style={saveBtn('#22c55e')}>{saving ? 'Saving...' : 'Save Draft Quotation'}</button>
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

function InfoCell({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '13px', fontWeight: highlight ? 700 : 500, color: highlight ? '#22c55e' : '#e8ecf4' }}>{value}</div>
    </div>
  )
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
