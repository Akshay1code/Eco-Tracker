function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_TRACKING_API_URL;

  if (!configured) {
    return 'http://localhost:3001';
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
