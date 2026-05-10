'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COUNTRY_IATA: Record<string, { iata: string; name: string }> = {
  PK: { iata: 'KHI', name: 'Pakistan' },
  DE: { iata: 'FRA', name: 'Germany' },
  US: { iata: 'JFK', name: 'United States' },
  GB: { iata: 'LHR', name: 'United Kingdom' },
  AE: { iata: 'DXB', name: 'UAE' },
  CN: { iata: 'PEK', name: 'China' },
  IN: { iata: 'BOM', name: 'India' },
  SA: { iata: 'RUH', name: 'Saudi Arabia' },
  TR: { iata: 'IST', name: 'Turkey' },
  IT: { iata: 'MXP', name: 'Italy' },
  FR: { iata: 'CDG', name: 'France' },
  NL: { iata: 'AMS', name: 'Netherlands' },
  CH: { iata: 'ZRH', name: 'Switzerland' },
  JP: { iata: 'NRT', name: 'Japan' },
  KR: { iata: 'ICN', name: 'South Korea' },
}

function generateCompanyID(country: string, iata: string, postal: string, name: string): string {
  const co = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 7).padEnd(7, 'X')
  return `${country}${iata}${postal}${co}`
}

export default function NewCompanyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    company_name: '', country: 'PK', iata: 'KHI', postal_code: '',
    city: '', address: '', phone: '', email: '', website: '',
    type: 'CUSTOMER', industry: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const companyID = form.company_name && form.postal_code
    ? generateCompanyID(form.country, form.iata, form.postal_code, form.company_name)
    : '— fill name & postal code —'

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'country') {
      const iata = COUNTRY_IATA[value]?.iata || ''
      setForm(f => ({ ...f, country: value, iata }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function handleSave() {
    setError('')
    if (!form.company_name || !form.postal_code || !form.city) {
      setError('Company Name, Postal Code, and City are required.')
      return
    }
    setSaving(true)
    const company_id = generateCompanyID(form.country, form.iata, form.postal_code, form.company_name)
    const { error: err } = await supabase.from('companies').upsert({
      company_id, company_name: form.company_name, country: form.country,
      iata_code: form.iata, postal_code: form.postal_code, city: form.city,
      address: form.address, phone: form.phone,
      email: form.email.toLowerCase().trim(), website: form.website,
      type: form.type, industry: form.industry, notes: form.notes,
      status: 'ACTIVE',
    }, { onConflict: 'company_id' })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(`Saved — ID: ${company_id}`)
    setTimeout(() => router.push('/dashboard/companies'), 1500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '760px' }}>
      <button onClick={() => router.back()} style={backBtn}>← Back</button>

      <div style={pageHeader('#c8922a')}>
        <div style={headerBadge('#c8922a')}>COMPANIES</div>
        <h1 style={pageTitle}>New Company</h1>
        <p style={pageSubtitle}>Add a customer, supplier, or both to the universal database</p>
      </div>

      <div style={idBox('#c8922a')}>
        <div style={idLabel}>AUTO-GENERATED COMPANY ID</div>
        <div style={{ ...idValue, color: '#e8a93a' }}>{companyID}</div>
        <div style={idHint}>Country + IATA + Postal + Company · Permanent & unique forever</div>
      </div>

      <div style={formCard('#1a1f2e')}>
        <div style={sectionTitle('#c8922a')}>Company Identity</div>
        <div style={row2}>
          <Field label="Company Name *"><input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Abbott Laboratories Pakistan" style={inp} /></Field>
          <Field label="Type"><select name="type" value={form.type} onChange={handleChange} style={inp}><option value="CUSTOMER">Customer</option><option value="SUPPLIER">Supplier</option><option value="BOTH">Both</option></select></Field>
        </div>
        <div style={row3}>
          <Field label="Country"><select name="country" value={form.country} onChange={handleChange} style={inp}>{Object.entries(COUNTRY_IATA).map(([code, { name }]) => <option key={code} value={code}>{code} — {name}</option>)}</select></Field>
          <Field label="IATA Code"><input name="iata" value={form.iata} onChange={handleChange} style={{ ...inp, textTransform: 'uppercase' }} maxLength={3} /></Field>
          <Field label="Postal Code *"><input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="75400" style={inp} /></Field>
        </div>
        <div style={row2}>
          <Field label="City *"><input name="city" value={form.city} onChange={handleChange} placeholder="Karachi" style={inp} /></Field>
          <Field label="Industry"><input name="industry" value={form.industry} onChange={handleChange} placeholder="Pharmaceuticals, Chemicals..." style={inp} /></Field>
        </div>
      </div>

      <div style={formCard('#1a2235')}>
        <div style={sectionTitle('#3b82f6')}>Contact Details</div>
        <Field label="Address"><input name="address" value={form.address} onChange={handleChange} placeholder="Street, Building, Area" style={inp} /></Field>
        <div style={{ ...row3, marginTop: '16px' }}>
          <Field label="Email"><input name="email" value={form.email} onChange={handleChange} placeholder="info@company.com" style={inp} /></Field>
          <Field label="Phone"><input name="phone" value={form.phone} onChange={handleChange} placeholder="+92-21-..." style={inp} /></Field>
          <Field label="Website"><input name="website" value={form.website} onChange={handleChange} placeholder="www.company.com" style={inp} /></Field>
        </div>
        <div style={{ marginTop: '16px' }}>
          <Field label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></Field>
        </div>
      </div>

      <div style={actions}>
        <button onClick={handleSave} disabled={saving} style={saveBtn('#c8922a')}>{saving ? 'Saving...' : 'Save Company'}</button>
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
