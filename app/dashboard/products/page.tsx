'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p =>
    p.product_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.mfg?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div className="animate-in" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Product intelligence database — assigned at quotation stage
          </p>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{ marginBottom: '20px' }}>
        <input
          className="input"
          placeholder="Search by code, name, manufacturer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              No products yet
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Products are assigned at quotation stage when manufacturer and packing are confirmed
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Grade</th>
                  <th>Packing</th>
                  <th>HS Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--accent-light)',
                        background: 'var(--accent-dim)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {p.product_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.cat}-{p.sub}
                    </td>
                    <td style={{ fontSize: '12px' }}>{p.mfg || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.grade || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {p.packing_size ? `${p.packing_size} ${p.packing_unit}` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{p.hs_code || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: p.status === 'ACTIVE' ? 'var(--green)' : 'var(--text-muted)',
                        }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.status}</span>
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
