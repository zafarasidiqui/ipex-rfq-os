'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const statuses = ['ALL', 'NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'LOST']

  useEffect(() => { loadProjects() }, [statusFilter])

  const loadProjects = async () => {
    setLoading(true)
    let query = supabase
      .from('rfq_projects')
      .select('*, companies(company_name)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setProjects(data || [])
    setLoading(false)
  }

  const filtered = projects.filter(p =>
    p.project_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_description?.toLowerCase().includes(search.toLowerCase()) ||
    p.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
    (p.companies as any)?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      NEW: 'badge-open',
      IN_PROGRESS: 'badge-pending',
      QUOTED: 'badge-quoted',
      WON: 'badge-won',
      LOST: 'badge-lost',
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
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            All RFQ projects — each with a unique project code
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push('/dashboard/projects/new')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
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
          placeholder="Search by code, product, company..."
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
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>No projects yet</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/projects/new')}
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Company</th>
                  <th>Product</th>
                  <th>Manufacturer</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-light)', letterSpacing: '0.08em' }}>
                        {p.project_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{(p.companies as any)?.company_name || p.company_id}</td>
                    <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.product_description}
                    </td>
                    <td style={{ fontSize: '12px' }}>{p.manufacturer || '—'}</td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.source || '—'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(p.status)}`} style={{ fontSize: '10px' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
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
