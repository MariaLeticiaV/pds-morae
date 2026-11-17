const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function registerUser(payload) {
  const response = await fetch(`${API_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || 'Não foi possível concluir o cadastro.');
  }

  return body;
}
