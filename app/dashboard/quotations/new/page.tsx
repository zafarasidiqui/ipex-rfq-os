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

interface FXRate {
  currency: string
  rate_pkr: number
  rate_date: string
}

export default function NewQuotationPage() {
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [fxRates, setFxRates] = useState<FXRate[]>([])
  const [form, setForm] = useState({
    project_code: '',
    unit_price: '',
    currency: 'USD',
    quantity: '1',
    validity_days: '30',
    payment_terms: '100% Advance',
    delivery_days: '',
    incoterms: 'CIF Karachi',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Load open projects
    supabase
      .from('rfq_projects')
      .select('project_code, product_description, manufacturer, company_id, companies(company_name), margin_step')
      .in('status', ['NEW', 'IN_PROGRESS', 'QUOTED'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data as unknown as Project[]) })

    // Load FX rates
    supabase
      .from('fx_rates')
      .select('currency, rate_pkr, rate_date')
      .then(({ data }) => { if (data) setFxRates(data) })
  }, [])

  const selectedProject = projects.find(p => p.project_code === form.project_code)
  const marginStep = selectedProject?.margin_step ?? 0
  const currentMarginPct = MARGIN_STEPS[Math.min(marginStep, MARGIN_STEPS.length - 1)]

  const fxRate = fxRates.find(r => r.currency === form.currency)
  const unitPrice = parseFloat(form.unit_price) || 0
  const qty = parseInt(form.quantity) || 1
  const totalForeign = unitPrice * qty
  const totalPKR = fxRate ? totalForeign * fxRate.rate_pkr : 0
  const marginAmount = totalPKR * (currentMarginPct / 100)
  const sellingPricePKR = totalPKR + marginAmount

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.project_code || !form.unit_price) {
      setError('Project and Unit Price are required.')
      return
    }
    setSaving(true)

    const now = new Date()
    const quote_date = now.toISOString().split('T')[0]
    const fx_date_frozen = fxRate?.rate_date || quote_date

    const { error: err } = await supabase.from('quotations').insert({
      project_code: form.project_code,
      company_id: selectedProject?.company_id,
      quote_date,
      fx_date_frozen,
      currency: form.currency,
      fx_rate_pkr: fxRate?.rate_pkr || null,
      unit_price: unitPrice,
      quantity: qty,
      total_foreign: totalForeign,
      total_pkr: totalPKR,
      margin_pct: currentMarginPct,
      margin_amount_pkr: marginAmount,
      selling_price_pkr: sellingPricePKR,
      validity_days: parseInt(form.validity_days),
      payment_terms: form.payment_terms,
      delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
      incoterms: form.incoterms,
      notes: form.notes,
      status: 'DRAFT',
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess('Quotation saved as DRAFT')
    setTimeout(() => router.push('/dashboard/quotations'), 1500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '780px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '12px' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Quotation</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>FX rates frozen at today — margin auto-calculated</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Project selection */}
        <Field label="Select Project *">
          <select name="project_code" value={form.project_code} onChange={handleChange}>
            <option value="">— Select Project —</option>
            {projects.map(p => (
              <option key={p.project_code} value={p.project_code}>
                {p.project_code} | {(p.companies as any)?.company_name || p.company_id} | {p.product_description?.substring(0, 50)}
              </option>
            ))}
          </select>
        </Field>

        {/* Project info strip */}
        {selectedProject && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <InfoCell label="Project" value={selectedProject.project_code} mono />
            <InfoCell label="Manufacturer" value={selectedProject.manufacturer || '—'} />
            <InfoCell label="Product" value={selectedProject.product_description?.substring(0, 40) || '—'} />
          </div>
        )}

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Unit Price *">
            <input name="unit_price" value={form.unit_price} onChange={handleChange} placeholder="0.00" type="number" step="0.01" />
          </Field>
          <Field label="Currency">
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="PKR">PKR</option>
            </select>
          </Field>
          <Field label="Quantity">
            <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="1" type="number" />
          </Field>
        </div>

        {/* FX + Margin Engine */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Margin Engine — Step {marginStep + 1} of 5 ({currentMarginPct}% margin)
          </div>

          {/* Margin steps */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {MARGIN_STEPS.map((pct, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '6px',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                background: i === marginStep ? 'var(--accent)' : 'var(--bg-primary)',
                color: i === marginStep ? '#fff' : i < marginStep ? '#f87171' : 'var(--text-muted)',
                border: `1px solid ${i === marginStep ? 'var(--accent)' : 'var(--border)'}`,
              }}>
                {pct}%
              </div>
            ))}
          </div>

          {/* Calculation grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <InfoCell label={`Total (${form.currency})`} value={totalForeign ? totalForeign.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'} mono />
            <InfoCell label={`FX Rate (PKR/${form.currency})`} value={fxRate ? fxRate.rate_pkr.toFixed(2) : 'Not loaded'} mono />
            <InfoCell label="Cost (PKR)" value={totalPKR ? `PKR ${Math.round(totalPKR).toLocaleString()}` : '—'} mono />
            <InfoCell
              label={`Selling Price (PKR) +${currentMarginPct}%`}
              value={sellingPricePKR ? `PKR ${Math.round(sellingPricePKR).toLocaleString()}` : '—'}
              mono
              highlight
            />
          </div>

          {fxRate && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
              FX rate frozen at: {fxRate.rate_date} — will not change after quotation is saved
            </div>
          )}
        </div>

        {/* Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Validity (days)">
            <input name="validity_days" value={form.validity_days} onChange={handleChange} type="number" />
          </Field>
          <Field label="Payment Terms">
            <input name="payment_terms" value={form.payment_terms} onChange={handleChange} placeholder="100% Advance" />
          </Field>
          <Field label="Delivery (days)">
            <input name="delivery_days" value={form.delivery_days} onChange={handleChange} placeholder="e.g. 45" type="number" />
          </Field>
          <Field label="Incoterms">
            <select name="incoterms" value={form.incoterms} onChange={handleChange}>
              <option>CIF Karachi</option>
              <option>FOB Origin</option>
              <option>EXW</option>
              <option>DAP Karachi</option>
              <option>DDP Karachi</option>
            </select>
          </Field>
        </div>

        <Field label="Notes">
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Internal notes for this quotation..." rows={3} />
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
          {saving ? 'Saving...' : 'Save Draft Quotation'}
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

function InfoCell({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{
        fontFamily: mono ? 'monospace' : 'inherit',
        fontSize: '13px',
        fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--accent)' : 'var(--text-primary)',
      }}>
        {value}
      </div>
    </div>
  )
}
