export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  // Try to get token from cookies
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
    
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback: try to get from localStorage (if you're storing it there)
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = getAuthHeaders();
  
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, requestOptions);
}