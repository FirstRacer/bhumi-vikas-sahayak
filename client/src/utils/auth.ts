export const AUTH_TOKEN_KEY = 'bhumi_auth_token';
export const AUTH_USER_KEY = 'bhumi_auth_user';

/**
 * Returns the backend API base URL.
 * In development, defaults to '' so Vite proxy handles '/api' -> 'http://localhost:5000'.
 * In production (Netlify), reads from import.meta.env.VITE_API_BASE_URL (e.g., https://your-backend.onrender.com).
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '';
  // Strip trailing slash if provided
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
}

/**
 * Prepends the backend base URL to relative API endpoints (e.g., '/api/health' -> 'https://backend.onrender.com/api/health')
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthSession(token: string, user: { id: string; name: string; email: string }): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): { id: string; name: string; email: string } | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Fetch wrapper that resolves the API base URL and attaches the Authorization header automatically
 */
export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If input is a relative path starting with /api, route it through buildApiUrl
  let resolvedUrl: RequestInfo | URL = input;
  if (typeof input === 'string' && input.startsWith('/')) {
    resolvedUrl = buildApiUrl(input);
  }

  const response = await fetch(resolvedUrl, {
    ...init,
    headers,
  });

  // If unauthorized, notify session expired
  if (response.status === 401) {
    clearAuthSession();
    window.dispatchEvent(new Event('auth_session_expired'));
  }

  return response;
}
