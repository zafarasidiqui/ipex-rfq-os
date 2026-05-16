'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CampaignPage() {
  const [projects, setProjects] = useState<{ project_code: string; product_description: string; manufacturer: string }[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [emailsRaw, setEmailsRaw] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [results, setResults] = useState<{ email: string; status: string }[]>([])
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    supabase.from('projects').select('project_code, product_description, manufacturer').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => setProjects(data || []))
  }, [])

  const selected = projects.find(p => p.project_code === selectedProject)

  const subject = selected
    ? `Enquiry No. ${selected.project_code} | ${selected.manufacturer || ''} | ${selected.product_description || ''}`
    : ''

  const body = selected ? `Dear Sir/Madam,

We are IPEX Industrial Projects Export GmbH, a trading company based in Karachi, Pakistan.

We have a requirement for the following:

Product: ${selected.product_description || ''}
Manufacturer: ${selected.manufacturer || ''}
Enquiry No.: ${selected.project_code}

Kindly provide us your best price, availability, and lead time.

Please reply with the Enquiry No. in the subject line for our reference.

Best regards,
IPEX Industrial Projects Export GmbH
info@ipexgmbh.com
www.ipexgmbh.com` : ''

  const emails = emailsRaw.split('\n').map(e => e.trim()).filter(e => e.includes('@'))

  const handleSend = async () => {
    if (!selectedProject || emails.length === 0) return
    setStatus('sending')
    setResults([])

    const res = await fetch('/api/send-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectCode: selectedProject, emails, subject, body }),
    })

    const data = await res.json()
    setResults(data.results || [])
    setStatus('done')
  }

  const sent = results.filter(r => r.status === 'SENT').length
  const failed = results.filter(r => r.status === 'FAILED').length

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
        Campaign <span style={{ color: 'var(--accent)' }}>Sender</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
        Send supplier enquiry emails for a project
      </p>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Select Project
        </label>
        <select
          className="input"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">-- Select a project --</option>
          {projects.map(p => (
            <option key={p.project_code} value={p.project_code}>
              {p.project_code} | {p.manufacturer} | {p.product_description}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Supplier Emails (one per line)
        </label>
        <textarea
          className="input"
          value={emailsRaw}
          onChange={e => setEmailsRaw(e.target.value)}
          placeholder="supplier1@company.com&#10;supplier2@company.com"
          rows={8}
          style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
        {emails.length > 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {emails.length} valid email{emails.length > 1 ? 's' : ''} detected
          </p>
        )}
      </div>

      {selectedProject && (
        <div style={{ marginBottom: '24px' }}>
          <button className="btn" onClick={() => setPreview(!preview)} style={{ marginBottom: '12px' }}>
            {preview ? 'Hide Preview' : 'Preview Email'}
          </button>
          {preview && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>
                <strong>From:</strong> IPEX Industrial Projects Export GmbH &lt;info@ipexgmbh.com&gt;<br />
                <strong>Subject:</strong> {subject}
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{body}</pre>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={!selectedProject || emails.length === 0 || status === 'sending'}
        style={{ padding: '12px 32px', fontSize: '14px' }}
      >
        {status === 'sending' ? `Sending... (${results.length}/${emails.length})` : `Send to ${emails.length} Supplier${emails.length !== 1 ? 's' : ''}`}
      </button>

      {status === 'done' && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>✅ {sent} sent</span>
            {failed > 0 && <span style={{ color: 'var(--red)', fontWeight: 700, marginLeft: '16px' }}>❌ {failed} failed</span>}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                <span>{r.email}</span>
                <span style={{ color: r.status === 'SENT' ? '#4ade80' : 'var(--red)' }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
