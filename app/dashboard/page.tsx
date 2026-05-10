'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ openProjects: 0, pendingQuotations: 0, totalCompanies: 0, totalProducts: 0 })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [proj, quot, comp, prod] = await Promise.all([
        supabase.from('rfq_projects').select('*', { count: 'exact', head: true }).in('status', ['NEW', 'IN_PROGRESS']),
        supabase.from('quotations').select('*', { count: 'exact', head: true }).in('status', ['DRAFT', 'PENDING_APPROVAL']),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        openProjects: proj.count || 0,
        pendingQuotations: quot.count || 0,
        totalCompanies: comp.count || 0,
        totalProducts: prod.count || 0,
      })
      const { data: recent } = await supabase
        .from('rfq_projects')
        .select('project_code, company_id, companies(company_name), product_description, manufacturer, status, created_at')
        .order('created_at', { ascending: false })
        .limit(8)
      setRecentProjects(recent || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const statCards = [
    { label: 'Open Projects', value: stats.openProjects, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: '📋' },
    { label: 'Pending Approval', value: stats.pendingQuotations, color: '#e8a93a', bg: 'rgba(232,169,58,0.12)', icon: '📄' },
    { label: 'Companies', value: stats.totalCompanies, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: '🏢' },
    { label: 'Products', value: stats.totalProducts, color: '#fb923c', bg: 'rgba(251,146,60,0.12)', icon: '📦' },
  ]

  const statusColor: Record<string, string> = {
    NEW: '#60a5fa', IN_PROGRESS: '#e8a93a', QUOTED: '#fb923c', WON: '#4ade80', LOST: '#f87171',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }} className="animate-in">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px', color: '#f1f5f9' }}>Good day, Zafar</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{dateStr}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', border: '1px solid #2d3f55', borderRadius: '8px', padding: '10px 16px' }}>
          <div className="live-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#e2e8f0' }}>{timeStr} PKT</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }} className="animate-in-delay-1">
        {statCards.map((card, i) => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid #2d3f55', borderRadius: '10px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: card.color }} />
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: card.color, lineHeight: 1, marginBottom: '8px' }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="animate-in-delay-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', color: '#f1f5f9' }}>Recent Projects</h2>
          <button onClick={() => router.push('/dashboard/projects')} style={{ fontSize: '13px', color: '#e8a93a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            View all →
          </button>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #2d3f55', borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : recentProjects.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>No projects yet</p>
              <button onClick={() => router.push('/dashboard/projects/new')} className="btn btn-primary">+ New Project</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #3d5068' }}>
                  {['Project Code', 'Company', 'Product', 'Manufacturer', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#94a3b8', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p, i) => (
                  <tr key={i} onClick={() => router.push('/dashboard/projects')} style={{ borderBottom: '1px solid #2d3f55', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#293548'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#e8a93a', background: 'rgba(232,169,58,0.12)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{p.project_code}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '14px', color: '#e2e8f0', fontWeight: 500 }}>{(p.companies as any)?.company_name || p.company_id || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#cbd5e1', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_description || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#cbd5e1' }}>{p.manufacturer || '—'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: statusColor[p.status] ? statusColor[p.status] + '22' : '#33405522', color: statusColor[p.status] || '#94a3b8', padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#94a3b8' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
