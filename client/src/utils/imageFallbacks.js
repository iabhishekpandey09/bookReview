function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getBookFallbackImage(title = "Book", width = 200, height = 280) {
  const safeTitle = String(title).slice(0, 12) || "Book";
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#1e293b' />
      <stop offset='100%' stop-color='#0f172a' />
    </linearGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#g)'/>
  <rect x='10' y='10' width='${width - 20}' height='${height - 20}' rx='8' fill='none' stroke='#f59e0b' stroke-width='2' opacity='0.7'/>
  <text x='50%' y='50%' text-anchor='middle' fill='#f8fafc' font-size='16' font-family='Arial, sans-serif' dy='-6'>BOOK</text>
  <text x='50%' y='50%' text-anchor='middle' fill='#f59e0b' font-size='12' font-family='Arial, sans-serif' dy='14'>${safeTitle}</text>
</svg>`;
  return toDataUri(svg);
}

export function getAvatarFallback(name = "User", size = 80) {
  const initials = initialsFromName(name);
  const fontSize = Math.max(12, Math.floor(size * 0.35));
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
  <defs>
    <linearGradient id='a' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#f59e0b' />
      <stop offset='100%' stop-color='#ef4444' />
    </linearGradient>
  </defs>
  <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2}' fill='url(#a)'/>
  <text x='50%' y='50%' text-anchor='middle' fill='#ffffff' font-size='${fontSize}' font-family='Arial, sans-serif' dy='.35em'>${initials}</text>
</svg>`;
  return toDataUri(svg);
}
