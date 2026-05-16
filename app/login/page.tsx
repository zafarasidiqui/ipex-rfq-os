'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OPERATOR_PASSWORD = 'ipex2026'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle'|'checking'|'ok'>('idle')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('checking')
    setError('')

    await new Promise(r => setTimeout(r, 500))

    if (password === OPERATOR_PASSWORD) {
      setStatus('ok')
      await new Promise(r => setTimeout(r, 800))
      localStorage.setItem('ipex_auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Wrong password. Try again.')
      setStatus('idle')
    }
  }

  const btnLabel =
    status === 'checking' ? 'Verifying...' :
    status === 'ok'       ? 'Correct  Entering system...' :
                            'Access System'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.3,
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(200,146,42,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-in" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '380px',
        padding: '0 20px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h14M3 8h10M3 12h12M3 16h8" stroke="#0a0c10" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '-0.02em',
            }}>
              IPEX <span style={{ color: 'var(--accent)' }}>RFQ</span> OS
            </span>
          </div>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Operator Access Only
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '6px' }}>Sign In</h2>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '13px',
            marginBottom: '28px',
          }}>
            IPEX Industrial Projects Export GmbH
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Operator Password
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--red-dim)',
                border: '1px solid rgba(231,76,60,0.2)',
                borderRadius: '6px',
                color: 'var(--red)',
                fontSize: '12px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            {status === 'ok' && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(39,174,96,0.1)',
                border: '1px solid rgba(39,174,96,0.3)',
                borderRadius: '6px',
                color: '#27ae60',
                fontSize: '12px',
                marginBottom: '16px',
              }}>
                Password correct. Entering system...
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status !== 'idle'}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {btnLabel}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
        }}>
          IPEX GmbH · Karachi · Private System
        </p>
      </div>
    </div>
  )
}
