const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://d4n67bdt-3001.uks1.devtunnels.ms')
    .replace(/\/+$/, ''); // remove trailing slash

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const normalizedPath = `/${path.replace(/^\/+/, '')}`; // force single leading slash

  const response = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
}