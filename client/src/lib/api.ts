const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const fetchApi = async (endpoint: string, options: RequestInit = {}, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'API request failed');
  }

  return response.json();
};
