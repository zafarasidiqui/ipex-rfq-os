// ── Add to your layout.tsx metadata export ──────────────────────────────────
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPEX Industrial Projects Export',
  description: 'Bi-national industrial trading company — Pakistan & Germany',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-32.png',  sizes: '32x32',   type: 'image/png' },
      { url: '/logo-96.png',  sizes: '96x96',   type: 'image/png' },
    ],
    apple: { url: '/logo-180.png', sizes: '180x180', type: 'image/png' },
    other: { rel: 'manifest', url: '/site.webmanifest' },
  },
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

// ── Add <AnimatedFavicon /> inside your layout's <body> ───────────────────────
// import AnimatedFavicon from '@/components/AnimatedFavicon';
// <body>
//   <AnimatedFavicon />
//   {children}
// </body>
