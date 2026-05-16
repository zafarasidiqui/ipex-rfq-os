'use client';
import { useEffect } from 'react';

/**
 * Drop this component anywhere in your root layout.tsx:
 *   import AnimatedFavicon from '@/components/AnimatedFavicon';
 *   ...
 *   <AnimatedFavicon />
 */
export default function AnimatedFavicon() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/animated-favicon.js';
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);
  return null;
}
