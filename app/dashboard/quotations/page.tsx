'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const statuses = ['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'LOST', 'EXPIRED']

  useEffect(() => { loadQuotations() }, [filter])

  const loadQuotations = async () => {
    setLoading(true)
    let query = supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'ALL') query = query.eq('status', filter)

    const { data } = await query
    setQuotations(data || [])
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: '', PENDING_APPROVAL: 'badge-pending',
      APPROVED: 'badge-open', SENT: 'badge-quoted',
      ACCEPTED: 'badge-won', LOST: 'badge-lost', EXPIRED: '',
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
            All quotations with FX rates, margin engine, and approval status
          </p>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 12px', borderRadius: '6px', border: '1px solid',
            borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
            background: filter === s ? 'var(--accent-dim)' : 'transparent',
            color: filter === s ? 'var(--accent-light)' : 'var(--text-muted)',
            fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            {s}
          </button>
        ))}
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : quotations.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No quotations found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quote No.</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Currency</th>
                  <th>Unit Price</th>
                  <th>Margin %</th>
                  <th>FX Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{q.quote_number}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                        color: 'var(--accent-light)', background: 'var(--accent-dim)',
                        padding: '2px 8px', borderRadius: '4px',
                      }}>
                        {q.project_code}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {q.quote_date ? new Date(q.quote_date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{q.currency}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {q.unit_price ? Number(q.unit_price).toLocaleString() : '—'}
                    </td>
                    <td style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: 'var(--accent-light)',
                    }}>
                      {q.margin_pct}%
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {q.fx_date_frozen || '—'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(q.status)}`} style={{ fontSize: '10px' }}>
                        {q.status}
                      </span>
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
