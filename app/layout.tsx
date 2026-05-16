import type { Metadata } from 'next'
import './globals.css'
import AnimatedFavicon from '@/components/AnimatedFavicon'

export const metadata: Metadata = {
  title: 'IPEX RFQ OS',
  description: 'IPEX Industrial Projects Export GmbH - RFQ Operating System',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/logo-180.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AnimatedFavicon />
        {children}
      </body>
    </html>
  )
}
