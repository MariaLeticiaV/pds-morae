import { getAdministratorSession } from './adminAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function listAdminListings({ search, status, page, limit, signal }) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  return adminRequest(`/admin/listings?${query}`, { signal });
}

export function getAdminListing(listingId, options = {}) {
  return adminRequest(`/admin/listings/${encodeURIComponent(listingId)}`, options);
}

export function moderateAdminListing(listingId, status) {
  return adminRequest(`/admin/listings/${encodeURIComponent(listingId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

async function adminRequest(path, options = {}) {
  const session = getAdministratorSession();
  if (!session) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Não foi possível conectar à API em ${API_URL}.`);
    }
    throw error;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message;
    throw new Error(message || 'Não foi possível consultar os anúncios.');
  }
  return body;
}
