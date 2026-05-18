function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_TRACKING_API_URL;

  // Production on Vercel: frontend and backend share the same origin.
  // An empty (or missing) env var means use relative URLs (no hostname prefix).
  if (!configured || configured.trim() === '') {
    // In a real browser context, distinguish prod (same-origin) from local dev.
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return ''; // Same-origin: /api/... will resolve correctly
    }
    return 'http://localhost:3001'; // Local dev fallback
  }

  if (typeof window === 'undefined') {
    return configured;
  }

  try {
    const url = new URL(configured);
    const isLoopbackHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const currentHost = window.location.hostname;
    const currentIsLoopback = currentHost === 'localhost' || currentHost === '127.0.0.1';

    // When the frontend is opened from a phone on the LAN, keep the configured port
    // but swap the API hostname away from localhost so requests still reach the laptop.
    if (isLoopbackHost && currentHost && !currentIsLoopback) {
      url.hostname = currentHost;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    // Fall back to the configured value when it is not a full URL.
  }

  return configured;
}

export const API_BASE_URL = resolveApiBaseUrl();
