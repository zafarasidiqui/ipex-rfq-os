'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const stages = ['ALL', 'RFQ', 'SOURCING', 'QUOTE', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST']

  useEffect(() => { loadProjects() }, [filter])

  const loadProjects = async () => {
    setLoading(true)
    let query = supabase
      .from('rfq_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'ALL') {
      query = query.eq('stage', filter)
    }

    const { data } = await query
    setProjects(data || [])
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'badge-open', IN_PROGRESS: 'badge-open',
      QUOTED: 'badge-quoted', WON: 'badge-won',
      LOST: 'badge-lost', ON_HOLD: 'badge-pending',
    }
    return map[status] || 'badge-pending'
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
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            All RFQ projects from intake to close
          </p>
        </div>
        <button className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      {/* Stage filter */}
      <div className="animate-in-delay-1" style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {stages.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
              background: filter === s ? 'var(--accent-dim)' : 'transparent',
              color: filter === s ? 'var(--accent-light)' : 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No projects found
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Product</th>
                  <th>Source</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Margin %</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--accent-light)',
                        background: 'var(--accent-dim)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {p.project_code}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.product_name_raw || '—'}
                    </td>
                    <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {p.source}
                    </td>
                    <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {p.stage}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: p.margin_locked ? 'var(--green)' : 'var(--accent-light)',
                    }}>
                      {p.margin_pct}% {p.margin_locked ? '🔒' : ''}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {p.rfq_date ? new Date(p.rfq_date).toLocaleDateString('en-GB') : '—'}
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
