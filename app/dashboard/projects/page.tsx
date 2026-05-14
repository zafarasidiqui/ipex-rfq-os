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
    let q = supabase
      .from('rfq_projects')
      .select('*, companies(company_name)')
      .order('created_at', { ascending: false })
    if (statusFilter !== 'ALL') q = q.eq('status', statusFilter)
    const { data } = await q
    setProjects(data || [])
    setLoading(false)
  }

  // Search across product, manufacturer, part_no, project_code, company
  const filtered = projects.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.project_code?.toLowerCase().includes(s) ||
      p.product_description?.toLowerCase().includes(s) ||
      p.manufacturer?.toLowerCase().includes(s) ||
      p.part_no?.toLowerCase().includes(s) ||
      (p.companies as any)?.company_name?.toLowerCase().includes(s)
    )
  })

  const statusColor: Record<string, string> = {
    NEW: '#60a5fa', IN_PROGRESS: '#e8a93a', QUOTED: '#fb923c',
    WON: '#4ade80', LOST: '#f87171',
  }

  function handleClone(p: any) {
    const params = new URLSearchParams({
      clone: p.project_code,
      product_description: p.product_description || '',
      manufacturer: p.manufacturer || '',
      part_no: p.part_no || '',
      currency: p.currency || 'USD',
      company_id: p.company_id || '',
      contact_name: p.contact_name || '',
      contact_email: p.contact_email || '',
      source: p.source || 'EMAIL',
    })
    router.push('/dashboard/projects/new?' + params.toString())
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1300px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>Projects</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>All RFQ projects — search, clone and track</p>
        </div>
        <button onClick={() => router.push('/dashboard/projects/new')}
          style={{ background: '#60a5fa', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          + New Project
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by product, manufacturer, part no, company, project code..."
          style={{ flex: 1, minWidth: '300px', background: '#ffffff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px 14px', color: '#111827', fontSize: '14px', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 12px', borderRadius: '6px', border: '2px solid',
              borderColor: statusFilter === s ? '#60a5fa' : '#2d3f55',
              background: statusFilter === s ? '#60a5fa22' : 'transparent',
              color: statusFilter === s ? '#60a5fa' : '#94a3b8',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#94a3b8' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#1e293b', border: '1px solid #2d3f55', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' as const, color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' as const }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
              {search ? 'No projects match "' + search + '"' : 'No projects yet'}
            </p>
            <button onClick={() => router.push('/dashboard/projects/new')}
              style={{ background: '#60a5fa', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
              + New Project
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3d5068' }}>
                {['Project Code', 'Company', 'Product', 'Manufacturer', 'Part No', 'Qty', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d3f55' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#293548'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#e8a93a', background: '#e8a93a22', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {p.project_code}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>
                    {(p.companies as any)?.company_name || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#cbd5e1', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {p.product_description || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#cbd5e1' }}>
                    {p.manufacturer || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {p.part_no || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#cbd5e1' }}>
                    {p.quantity || '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: (statusColor[p.status] || '#94a3b8') + '22', color: statusColor[p.status] || '#94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8' }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => handleClone(p)} title="Clone this project into a new one"
                      style={{ background: '#4ade8022', color: '#4ade80', border: '1px solid #4ade8044', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      ⧉ Clone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
