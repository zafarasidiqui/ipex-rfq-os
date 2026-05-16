# IPEX Website Assets

## Files in this package

### → Copy to  /public/
  favicon.ico           – Standard favicon (16/32/48px multi-size)
  logo-16.png           – 16×16
  logo-32.png           – 32×32
  logo-96.png           – 96×96
  logo-180.png          – Apple touch icon (180×180)
  logo-192.png          – PWA icon
  logo-512.png          – PWA splash icon
  logo-full.png         – Full resolution (800×380)
  og-image.jpg          – Social / Open Graph preview (1200×630)
  site.webmanifest      – PWA manifest
  animated-favicon.js   – Animated waving flag favicon script

### → Copy to  /components/
  AnimatedFavicon.tsx   – Next.js client component

### → Merge into  app/layout.tsx
  layout-metadata.ts    – Metadata export + usage instructions

## Animated favicon

The favicon animates the IPEX flag waving in every browser tab.
It works in Chrome, Firefox, Edge and Safari.

To enable, add this single line inside your layout's <body>:

  <AnimatedFavicon />

That's it. The script self-loads, overrides the static favicon,
and runs the canvas wave loop automatically.
