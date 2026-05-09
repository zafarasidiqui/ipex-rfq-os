'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const filters = ['ALL', 'TOPROCESS', 'RFQ', 'BOUNCE', 'HUMAN_REPLY', 'AUTO_REPLY']

  useEffect(() => { loadMessages() }, [filter])

  const loadMessages = async () => {
    setLoading(true)
    let query = supabase
      .from('inbox_log')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(50)

    if (filter === 'TOPROCESS') query = query.eq('status', 'TOPROCESS')
    else if (filter !== 'ALL') query = query.eq('ai_classification', filter)

    const { data } = await query
    setMessages(data || [])
    setLoading(false)
  }

  const getClassBadge = (cls: string) => {
    const map: Record<string, string> = {
      RFQ: 'badge-won', BOUNCE: 'badge-lost',
      HUMAN_REPLY: 'badge-open', AUTO_REPLY: '',
      SPAM: 'badge-lost', OTHER: '',
    }
    return map[cls] || ''
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
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Inbox</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            All incoming emails — AI classified and ready to process
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ipexbounce@gmail.com
          </span>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: '6px', border: '1px solid',
            borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
            background: filter === f ? 'var(--accent-dim)' : 'transparent',
            color: filter === f ? 'var(--accent-light)' : 'var(--text-muted)',
            fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            {f}
          </button>
        ))}
      </div>

      <div className="animate-in-delay-2 card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inbox...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Inbox is empty</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Emails arrive via ipexbounce@gmail.com → Apps Script → here
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Classification</th>
                  <th>Confidence</th>
                  <th>Routing</th>
                  <th>Project</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '12px' }}>{m.from_email || '—'}</td>
                    <td style={{
                      maxWidth: '200px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontSize: '13px',
                    }}>
                      {m.subject || '—'}
                    </td>
                    <td>
                      {m.ai_classification ? (
                        <span className={`badge ${getClassBadge(m.ai_classification)}`} style={{ fontSize: '10px' }}>
                          {m.ai_classification}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                      )}
                    </td>
                    <td>
                      {m.ai_confidence ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '12px',
                          color: m.ai_confidence >= 90 ? 'var(--green)'
                            : m.ai_confidence >= 70 ? 'var(--accent-light)'
                            : 'var(--red)',
                        }}>
                          {m.ai_confidence}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {m.ai_routing || '—'}
                    </td>
                    <td>
                      {m.linked_project_code ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '11px',
                          color: 'var(--accent-light)', background: 'var(--accent-dim)',
                          padding: '2px 6px', borderRadius: '4px',
                        }}>
                          {m.linked_project_code}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {m.received_at ? new Date(m.received_at).toLocaleDateString('en-GB') : '—'}
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
