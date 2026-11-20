import { getUserSession, saveUserSession } from './userAuth.js';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'morae.accessToken';

async function request(path, { body, token, ...options } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Não foi possível conectar à API em ${API_URL}. Inicie o backend e tente novamente.`,
      );
    }

    throw error;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const message = Array.isArray(result?.message)
      ? result.message.join(' ')
      : result?.message;

    throw new Error(message || 'Não foi possível concluir a solicitação.');
  }

  return result;
}

export function registerUser(payload) {
  return request('/user', {
    method: 'POST',
    body: payload,
  });
}

export function registerStudent(payload) {
  return request('/students', {
    method: 'POST',
    body: payload,
  });
}

export function registerPropertyOwner(payload) {
  return request('/property-owners', {
    method: 'POST',
    body: payload,
  });
}

export async function loginUser({ email, password }) {
  const body = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (
    !body ||
    typeof body.userId !== 'string' ||
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.status !== 'string' ||
    typeof body.accessToken !== 'string' ||
    body.accessToken.length === 0 ||
    body.tokenType !== 'Bearer'
  ) {
    throw new Error('A resposta de autenticação do usuário é inválida.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, body.accessToken);
  saveUserSession(body);

  return body;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function calculateCompatibility(
  targetUserId,
  token = getAccessToken(),
) {
  if (!token) {
    throw new Error('Faça login para consultar a compatibilidade.');
  }

  return request(
    `/matching/compatibility/${encodeURIComponent(targetUserId)}`,
    { token },
  );
}

export async function publishProperty({ fields, photos }) {
  const session = getUserSession();

  if (!session) {
    throw new Error('Entre na sua conta para publicar um imóvel.');
  }

  const housingTypes = {
    Apartamento: 'APARTMENT',
    Casa: 'HOUSE',
    Quarto: 'ROOM',
    República: 'REPUBLIC',
  };

  const minimumStays = {
    'Sem prazo mínimo': 'NO_MINIMUM',
    '3 meses': 'THREE_MONTHS',
    '6 meses': 'SIX_MONTHS',
    '12 meses': 'TWELVE_MONTHS',
  };

  const form = new FormData();

  const values = {
    postalCode: String(fields.cep || '').replace(/\D/g, ''),
    state: fields.state,
    street: fields.street,
    number: fields.number,
    complement: fields.complement,
    city: fields.city,
    neighborhood: fields.neighborhood,
    housingType: housingTypes[fields.propertyType],
    bedrooms: fields.rooms,
    bathrooms: fields.bathrooms,
    parkingSpaces: fields.parking || '0',
    amenities: JSON.stringify(fields.amenities),
    title: fields.listingTitle,
    description: fields.description,
    rules: fields.rules,
    rent: fields.rent,
    condominium: fields.condominium,
    contractType: 'MONTHLY_RENTAL',
    minimumStay: minimumStays[fields.minimumStay],
  };

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value);
    }
  }

  photos.forEach((photo) => form.append('photos', photo));

  let response;

  try {
    response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: form,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Não foi possível conectar à API em ${API_URL}. Inicie o backend e tente novamente.`,
      );
    }

    throw error;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message;

    throw new Error(message || 'Não foi possível publicar o imóvel.');
  }

  if (
    !body ||
    typeof body.propertyId !== 'string' ||
    typeof body.listingId !== 'string'
  ) {
    throw new Error('A resposta do cadastro do imóvel é inválida.');
  }

  return body;
}

export async function requestPasswordReset(email) {
  await sendPasswordResetRequest(
    'request',
    { email },
    'Não foi possível solicitar a recuperação de senha.',
  );
}

export async function resetPassword({
  token,
  password,
  passwordConfirmation,
}) {
  await sendPasswordResetRequest(
    'confirm',
    { token, password, passwordConfirmation },
    'Não foi possível alterar a senha.',
  );
}

async function sendPasswordResetRequest(action, payload, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/password-reset/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Não foi possível conectar à API em ${API_URL}. Inicie o backend e tente novamente.`,
      );
    }

    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message;

    throw new Error(message || fallbackMessage);
  }
}
