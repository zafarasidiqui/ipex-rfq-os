/**
 * IPEX Animated Waving Flag Favicon
 * Drop in /public/animated-favicon.js  (or inline in layout)
 * Works in Chrome, Firefox, Edge, Safari
 */
(function() {
  const IMG_SRC = 'data:image/png;base64,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';
  const SIZE = 64;
  const SPEED = 0.16;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = IMG_SRC;

  // Get or create favicon link element
  function getFavicon() {
    let link = document.querySelector("link[rel~='icon'][data-animated]");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.dataset.animated = '1';
      // Remove any existing favicons
      document.querySelectorAll("link[rel~='icon']:not([data-animated])").forEach(l => l.remove());
      document.head.appendChild(link);
    }
    return link;
  }

  let t = 0;
  function frame() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Flag is wider than tall — center vertically
    const FW = img.naturalWidth  || 128;
    const FH = img.naturalHeight || 61;
    const drawH = Math.round(SIZE * FH / FW);
    const offsetY = Math.round((SIZE - drawH) / 2);
    const SW = 2;   // slice width in canvas pixels

    for (let x = 0; x < SIZE; x += SW) {
      const prog = x / SIZE;
      const amp  = 6 * prog * prog;
      const dy   = Math.sin(prog * Math.PI * 2.2 + t) * amp;
      ctx.drawImage(img,
        (x / SIZE) * FW, 0, (SW / SIZE) * FW, FH,
        x, offsetY + dy, SW, drawH);
    }

    getFavicon().href = canvas.toDataURL('image/png');
    t += SPEED;
    requestAnimationFrame(frame);
  }

  img.onload = () => frame();
})();
