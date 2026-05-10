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
  const co = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 7)
    .padEnd(7, 'X')
  return `${country}${iata}${postal}${co}`
}

export default function NewCompanyPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    company_name: '',
    country: 'PK',
    iata: 'KHI',
    postal_code: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    type: 'CUSTOMER',
    industry: '',
    notes: '',
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
      company_id,
      company_name: form.company_name,
      country: form.country,
      iata_code: form.iata,
      postal_code: form.postal_code,
      city: form.city,
      address: form.address,
      phone: form.phone,
      email: form.email.toLowerCase().trim(),
      website: form.website,
      type: form.type,
      industry: form.industry,
      notes: form.notes,
    }, { onConflict: 'company_id' })

    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(`Company saved — ID: ${company_id}`)
    setTimeout(() => router.push('/dashboard/companies'), 1500)
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
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Company</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Add a customer, supplier, or both</p>
      </div>

      {/* Company ID Preview */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Auto-Generated Company ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>
            {companyID}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Country + IATA + Postal + Company<br />
          This ID is permanent and unique forever
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Company Name *">
            <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="e.g. Abbott Laboratories" />
          </Field>
          <Field label="Type">
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="BOTH">Both</option>
            </select>
          </Field>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Country">
            <select name="country" value={form.country} onChange={handleChange}>
              {Object.entries(COUNTRY_IATA).map(([code, { name }]) => (
                <option key={code} value={code}>{code} — {name}</option>
              ))}
            </select>
          </Field>
          <Field label="IATA Code">
            <input name="iata" value={form.iata} onChange={handleChange} placeholder="KHI" maxLength={3} style={{ textTransform: 'uppercase' }} />
          </Field>
          <Field label="Postal Code *">
            <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="75400" />
          </Field>
        </div>

        {/* Row 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="City *">
            <input name="city" value={form.city} onChange={handleChange} placeholder="Karachi" />
          </Field>
          <Field label="Industry">
            <input name="industry" value={form.industry} onChange={handleChange} placeholder="Pharmaceuticals, Chemicals..." />
          </Field>
        </div>

        {/* Row 4 */}
        <Field label="Address">
          <input name="address" value={form.address} onChange={handleChange} placeholder="Street, Building, Area" />
        </Field>

        {/* Row 5 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Field label="Email">
            <input name="email" value={form.email} onChange={handleChange} placeholder="procurement@company.com" />
          </Field>
          <Field label="Phone">
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+92-21-..." />
          </Field>
          <Field label="Website">
            <input name="website" value={form.website} onChange={handleChange} placeholder="www.company.com" />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." rows={3} />
        </Field>

      </div>

      {/* Actions */}
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
          {saving ? 'Saving...' : 'Save Company'}
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
      <div style={{ position: 'relative' }}>
        {children}
      </div>
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
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent);
        }
        select option { background: #1a1a2e; }
        textarea { resize: vertical; }
      `}</style>
    </div>
  )
}
