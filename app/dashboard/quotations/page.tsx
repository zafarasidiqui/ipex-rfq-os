'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const statuses = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']

  useEffect(() => { loadQuotations() }, [statusFilter])

  const loadQuotations = async () => {
    setLoading(true)
    let query = supabase
      .from('quotations')
      .select('*, companies(company_name)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setQuotations(data || [])
    setLoading(false)
  }

  const filtered = quotations.filter(q =>
    q.project_code?.toLowerCase().includes(search.toLowerCase()) ||
    (q.companies as any)?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'badge-pending',
      SENT: 'badge-quoted',
      ACCEPTED: 'badge-won',
      REJECTED: 'badge-lost',
      EXPIRED: 'badge-lost',
    }
    return map[status] || ''
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div className="animate-in" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Quotations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            All quotations — FX frozen, margin tracked
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push('/dashboard/quotations/new')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Quotation
        </button>
      </div>

      <div className="animate-in-delay-1" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          className="input"
          placeholder="Search by project code or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                background: statusFilter === s ? 'var(--accent-dim)' : 'transparent',
                color: statusFilter === s ? 'var(--accent-light)' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading quotations...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>No quotations yet</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/quotations/new')}
            >
              + Create First Quotation
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Company</th>
                  <th>Currency</th>
                  <th>Unit Price</th>
                  <th>Selling (PKR)</th>
                  <th>Margin</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-light)', letterSpacing: '0.08em' }}>
                        {q.project_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{(q.companies as any)?.company_name || q.company_id || '—'}</td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{q.currency}</td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {q.unit_price ? q.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>
                      {q.selling_price_pkr ? `PKR ${Math.round(q.selling_price_pkr).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {q.margin_pct ? `${q.margin_pct}%` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(q.status)}`} style={{ fontSize: '10px' }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {q.quote_date || (q.created_at ? new Date(q.created_at).toLocaleDateString('en-GB') : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
