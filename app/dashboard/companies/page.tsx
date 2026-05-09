'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const types = ['ALL', 'CUSTOMER', 'SUPPLIER', 'MANUFACTURER', 'BOTH', 'PROSPECT']

  useEffect(() => { loadCompanies() }, [typeFilter])

  const loadCompanies = async () => {
    setLoading(true)
    let query = supabase
      .from('companies')
      .select('*')
      .order('company_name', { ascending: true })

    if (typeFilter !== 'ALL') {
      query = query.eq('type', typeFilter)
    }

    const { data } = await query
    setCompanies(data || [])
    setLoading(false)
  }

  const filtered = companies.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company_id?.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase())
  )

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      CUSTOMER: 'badge-open',
      SUPPLIER: 'badge-quoted',
      MANUFACTURER: 'badge-pending',
      BOTH: 'badge-won',
      PROSPECT: '',
      BLACKLISTED: 'badge-lost',
    }
    return map[type] || ''
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
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Companies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Customers, suppliers and manufacturers — one universal database
          </p>
        </div>
        <button className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Company
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
          placeholder="Search by name, ID, country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: typeFilter === t ? 'var(--accent)' : 'var(--border)',
                background: typeFilter === t ? 'var(--accent-dim)' : 'transparent',
                color: typeFilter === t ? 'var(--accent-light)' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading companies...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No companies found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Company ID</th>
                  <th>Company Name</th>
                  <th>Type</th>
                  <th>Country</th>
                  <th>Industry</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}>
                        {c.company_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{c.company_name}</td>
                    <td>
                      <span className={`badge ${getTypeBadge(c.type)}`} style={{ fontSize: '10px' }}>
                        {c.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{c.country || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.industry || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{c.primary_contact || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: c.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)',
                        }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {c.status}
                        </span>
                      </div>
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
