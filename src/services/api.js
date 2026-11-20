const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'morae.accessToken';

async function request(path, { body, token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(result?.message)
      ? result.message.join(' ')
      : result?.message;
    throw new Error(message || 'Não foi possível concluir a solicitação.');
  }
  return result;
}

export function registerStudent(payload) {
  return request('/students', { method: 'POST', body: payload });
}

export function registerPropertyOwner(payload) {
  return request('/property-owners', { method: 'POST', body: payload });
}

export async function loginUser(payload) {
  const result = await request('/auth/login', { method: 'POST', body: payload });
  if (!result?.accessToken) throw new Error('A API não retornou o token de acesso.');
  localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
  return result;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function calculateCompatibility(targetUserId, token = getAccessToken()) {
  if (!token) throw new Error('Faça login para consultar a compatibilidade.');
  return request(`/matching/compatibility/${encodeURIComponent(targetUserId)}`, { token });
}
