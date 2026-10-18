const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.')
);

export const LOCAL_BACKEND_PORT = '5000';
export const LOCAL_BACKEND_URL = typeof window !== 'undefined' && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:${LOCAL_BACKEND_PORT}`
  : `http://localhost:${LOCAL_BACKEND_PORT}`;

const envApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
// When running locally, prefer local backend unless explicit non-production VITE_API_BASE_URL is set
export const API_BASE = (envApiBase && !envApiBase.includes('backend.mybigbazaar.com'))
  ? envApiBase
  : (isLocal ? LOCAL_BACKEND_URL : (envApiBase || 'https://backend.mybigbazaar.com'));

const envStorefront = (import.meta.env.VITE_STOREFRONT_URL || '').replace(/\/+$/, '');
export const STOREFRONT_URL = (envStorefront && !envStorefront.includes('mybigbazaar.com'))
  ? envStorefront
  : (import.meta.env.DEV && isLocal ? 'http://localhost:3001' : 'https://mybigbazaar.com');

export const DEFAULT_PRODUCT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#1e293b"/>
  <rect x="16" y="16" width="368" height="368" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <g transform="translate(140, 110)">
    <path d="M20 30h80l-10 70H30L20 30z" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M40 30V20a20 20 0 0 1 40 0v10" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
    <circle cx="45" cy="115" r="8" fill="#64748b"/>
    <circle cx="75" cy="115" r="8" fill="#64748b"/>
  </g>
  <text x="200" y="270" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#94a3b8">MyBigBazaar</text>
  <text x="200" y="295" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">No Image Available</text>
</svg>
`.trim())}`;

export const DEFAULT_SERVICE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#1e293b"/>
  <rect x="16" y="16" width="368" height="368" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <g transform="translate(145, 115)">
    <path d="M15 80l40-40 20 20-40 40H15v-20z" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M65 30l15-15a18 18 0 0 1 25 25L90 55" stroke="#64748b" stroke-width="4" stroke-linecap="round" fill="none"/>
  </g>
  <text x="200" y="270" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#94a3b8">MyBigBazaar</text>
  <text x="200" y="295" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">Professional Service</text>
</svg>
`.trim())}`;

export const getAssetUrl = (path) => {
  if (!path) return DEFAULT_PRODUCT_PLACEHOLDER;
  if (path === '/placeholder-product.png' || path.includes('placeholder-product')) return '/placeholder-product.png';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  // Handle absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // If it points to broken backend.mybigbazaar.com and we are running local, rewrite to local backend
    if (isLocal && (path.includes('backend.mybigbazaar.com') || /^https?:\/\/localhost(:\d+)?/.test(path))) {
      return path.replace(/https?:\/\/[^/]+/, LOCAL_BACKEND_URL);
    }
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // For uploaded assets (/uploads/...) or relative paths
  const base = isLocal ? LOCAL_BACKEND_URL : API_BASE;
  return `${base}${cleanPath}`;
};

