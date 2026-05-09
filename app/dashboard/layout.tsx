'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('ipex_auth')
    if (!auth) {
      router.push('/login')
    }
  }, [router])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}>
        {children}
      </main>
    </div>
  )
}
