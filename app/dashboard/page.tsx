'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  openProjects: number
  pendingQuotations: number
  totalCompanies: number
  totalProducts: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    openProjects: 0,
    pendingQuotations: 0,
    totalCompanies: 0,
    totalProducts: 0,
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projects, quotations, companies, products] = await Promise.all([
        supabase.from('rfq_projects').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
        supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_APPROVAL'),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        openProjects: projects.count || 0,
        pendingQuotations: quotations.count || 0,
        totalCompanies: companies.count || 0,
        totalProducts: products.count || 0,
      })

      const { data: recent } = await supabase
        .from('rfq_projects')
        .select('project_code, customer_company_id, product_name_raw, stage, status, rfq_date')
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
    {
      label: 'Open Projects',
      value: stats.openProjects,
      color: 'var(--blue)',
      colorDim: 'var(--blue-dim)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 5h14M2 9h10M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Pending Approval',
      value: stats.pendingQuotations,
      color: 'var(--accent-light)',
      colorDim: 'var(--accent-dim)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M10 2H5a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V7M10 2l4 4M10 2v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Companies',
      value: stats.totalCompanies,
      color: 'var(--green)',
      colorDim: 'var(--green-dim)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 16V6l7-4 7 4v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M7 16v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      color: 'var(--orange)',
      colorDim: 'var(--orange-dim)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1l7 4v8l-7 4-7-4V5l7-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ]

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'badge-open',
      IN_PROGRESS: 'badge-open',
      QUOTED: 'badge-quoted',
      WON: 'badge-won',
      LOST: 'badge-lost',
      ON_HOLD: 'badge-pending',
    }
    return map[status] || 'badge-pending'
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>

      {/* Header */}
      <div className="animate-in" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>
            Good day, Zafar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            {dateStr}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 16px',
        }}>
          <div className="live-dot" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            {timeStr} PKT
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="animate-in-delay-1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map((card, i) => (
          <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: card.color,
              opacity: 0.6,
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: card.colorDim,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 700,
              color: card.color,
              lineHeight: 1,
              marginBottom: '6px',
            }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="animate-in-delay-2">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '16px' }}>Recent Projects</h2>
          <a href="/dashboard/projects" style={{
            fontSize: '12px',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
          }}>
            View all →
          </a>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : recentProjects.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-muted)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7h18M3 12h12M3 17h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                No projects yet
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Projects will appear here as RFQs come in
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Project Code</th>
                    <th>Product</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p, i) => (
                    <tr key={i} onClick={() => window.location.href = `/dashboard/projects/${p.project_code}`}>
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
                      <td>{p.product_name_raw || '—'}</td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {p.stage}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
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
    </div>
  )
}
