const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ADMIN_SESSION_KEY = 'morae-admin-session';

export async function loginAdministrator({ login, password }) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Não foi possível conectar à API em ${API_URL}. Inicie o backend e tente novamente.`);
    }

    throw error;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message;
    throw new Error(message || 'Não foi possível autenticar o administrador.');
  }

  if (
    !body ||
    typeof body.administratorId !== 'string' ||
    typeof body.userId !== 'string' ||
    typeof body.login !== 'string' ||
    !Array.isArray(body.permissions) ||
    typeof body.accessToken !== 'string' ||
    body.accessToken.length === 0 ||
    body.tokenType !== 'Bearer'
  ) {
    throw new Error('A resposta de autenticação administrativa é inválida.');
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(body));
  return body;
}

export function getAdministratorSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY));
    if (
      session &&
      typeof session.administratorId === 'string' &&
      typeof session.userId === 'string' &&
      typeof session.login === 'string' &&
      Array.isArray(session.permissions) &&
      typeof session.accessToken === 'string' &&
      session.accessToken.length > 0 &&
      session.tokenType === 'Bearer'
    ) {
      return session;
    }
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  return null;
}

export function logoutAdministrator() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
