import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IPEX RFQ OS',
  description: 'IPEX Industrial Projects Export GmbH — RFQ Operating System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
