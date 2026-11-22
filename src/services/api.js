import { getUserSession, saveUserSession } from './userAuth.js';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'morae.accessToken';

async function request(
  path,
  {
    body,
    token,
    unauthorizedMessage = 'E-mail ou senha inválidos.',
    ...options
  } = {},
) {
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
      throw new Error(unauthorizedMessage);
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

const paymentStatuses = new Set([
  'PENDING',
  'PAID',
  'REJECTED',
  'OVERDUE',
  'CANCELLED',
  'REFUNDED',
]);
const paymentMethods = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de crédito',
  BANK_TRANSFER: 'Transferência bancária',
  OTHER: 'Outro',
};

function getAuthenticatedToken() {
  const token = getAccessToken();
  if (!token) throw new Error('Entre na sua conta para continuar.');
  return token;
}

function authenticatedRequest(path, options = {}) {
  return request(path, {
    ...options,
    token: getAuthenticatedToken(),
    unauthorizedMessage: 'Sua sessão expirou. Entre novamente para continuar.',
  });
}

export async function getPaymentTransactions({ from, to, status } = {}) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (status && status !== 'all') params.set('status', status.toUpperCase());
  const query = params.toString();
  const body = await authenticatedRequest(
    `/payments${query ? `?${query}` : ''}`,
  );

  if (!Array.isArray(body)) {
    throw new Error('A resposta do histórico de pagamentos é inválida.');
  }

  return body.map((transaction) => {
    if (
      !transaction ||
      typeof transaction.id !== 'string' ||
      typeof transaction.description !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(transaction.date) ||
      !Number.isSafeInteger(transaction.amountInCents) ||
      transaction.amountInCents < 0 ||
      (transaction.rentAmountInCents !== null &&
        (!Number.isSafeInteger(transaction.rentAmountInCents) ||
          transaction.rentAmountInCents < 0)) ||
      (transaction.platformFeeInCents !== null &&
        (!Number.isSafeInteger(transaction.platformFeeInCents) ||
          transaction.platformFeeInCents < 0)) ||
      !paymentStatuses.has(transaction.status) ||
      (transaction.paymentMethod !== null &&
        !Object.prototype.hasOwnProperty.call(paymentMethods, transaction.paymentMethod)) ||
      !['INCOMING', 'OUTGOING'].includes(transaction.direction) ||
      typeof transaction.counterpartyName !== 'string'
    ) {
      throw new Error('A resposta do histórico contém uma transação inválida.');
    }

    return {
      id: transaction.id,
      title: transaction.description,
      date: transaction.date,
      amountInCents: transaction.amountInCents,
      rentAmountInCents: transaction.rentAmountInCents,
      platformFeeInCents: transaction.platformFeeInCents,
      status: transaction.status.toLowerCase(),
      method: transaction.paymentMethod
        ? paymentMethods[transaction.paymentMethod]
        : 'Não informado',
      direction: transaction.direction.toLowerCase(),
      counterparty: transaction.counterpartyName,
    };
  });
}

const rentalContractStatuses = new Set([
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'TERMINATED',
]);

function mapRentalContract(contract) {
  if (
    !contract ||
    typeof contract.id !== 'string' ||
    typeof contract.listingId !== 'string' ||
    typeof contract.listingTitle !== 'string' ||
    typeof contract.neighborhood !== 'string' ||
    typeof contract.city !== 'string' ||
    typeof contract.ownerId !== 'string' ||
    typeof contract.ownerName !== 'string' ||
    typeof contract.ownerEmail !== 'string' ||
    typeof contract.tenantId !== 'string' ||
    typeof contract.tenantName !== 'string' ||
    typeof contract.tenantEmail !== 'string' ||
    !Number.isSafeInteger(contract.monthlyRentInCents) ||
    typeof contract.startsAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(contract.startsAt) ||
    (contract.endsAt !== null &&
      (typeof contract.endsAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(contract.endsAt))) ||
    !Number.isInteger(contract.dueDay) ||
    contract.dueDay < 1 ||
    contract.dueDay > 28 ||
    !rentalContractStatuses.has(contract.status) ||
    typeof contract.currentUserIsTenant !== 'boolean' ||
    typeof contract.ownerMercadoPagoConnected !== 'boolean'
  ) {
    throw new Error('A resposta de contratos de aluguel é inválida.');
  }

  return {
    id: contract.id,
    listingId: contract.listingId,
    listingTitle: contract.listingTitle,
    neighborhood: contract.neighborhood,
    city: contract.city,
    ownerId: contract.ownerId,
    ownerName: contract.ownerName,
    ownerEmail: contract.ownerEmail,
    tenantId: contract.tenantId,
    tenantName: contract.tenantName,
    tenantEmail: contract.tenantEmail,
    monthlyRentInCents: contract.monthlyRentInCents,
    startsAt: contract.startsAt,
    endsAt: contract.endsAt,
    dueDay: contract.dueDay,
    status: contract.status,
    currentUserIsTenant: contract.currentUserIsTenant,
    ownerMercadoPagoConnected: contract.ownerMercadoPagoConnected,
  };
}

export async function getRentalContracts() {
  const body = await authenticatedRequest('/rental-contracts');
  if (!Array.isArray(body)) {
    throw new Error('A resposta de contratos de aluguel é inválida.');
  }
  return body.map(mapRentalContract);
}

export async function getOwnedRentalListings() {
  const body = await authenticatedRequest('/rental-contracts/listings');
  if (!Array.isArray(body)) {
    throw new Error('A resposta de imóveis para locação é inválida.');
  }
  return body.map((listing) => {
    if (
      !listing ||
      typeof listing.id !== 'string' ||
      typeof listing.title !== 'string' ||
      typeof listing.neighborhood !== 'string' ||
      typeof listing.city !== 'string' ||
      !Number.isSafeInteger(listing.rentInCents)
    ) {
      throw new Error('A resposta contém um imóvel para locação inválido.');
    }
    return listing;
  });
}

export async function createRentalContract(payload) {
  const body = await authenticatedRequest('/rental-contracts', {
    method: 'POST',
    body: payload,
  });
  if (
    !body ||
    typeof body.id !== 'string' ||
    body.status !== 'PENDING'
  ) {
    throw new Error('A resposta de criação do contrato é inválida.');
  }
  return body;
}

export async function acceptRentalContract(contractId) {
  return authenticatedRequest(
    `/rental-contracts/${encodeURIComponent(contractId)}/accept`,
    { method: 'POST' },
  );
}

export async function rejectRentalContract(contractId) {
  return authenticatedRequest(
    `/rental-contracts/${encodeURIComponent(contractId)}/reject`,
    { method: 'POST' },
  );
}

export async function terminateRentalContract(contractId) {
  return authenticatedRequest(
    `/rental-contracts/${encodeURIComponent(contractId)}/terminate`,
    { method: 'POST' },
  );
}

export async function getMercadoPagoConnection() {
  const body = await authenticatedRequest('/payments/mercado-pago/connection');
  if (
    !body ||
    typeof body.canManageContracts !== 'boolean' ||
    typeof body.connected !== 'boolean' ||
    !Number.isFinite(body.platformFeePercent) ||
    body.platformFeePercent < 0 ||
    body.platformFeePercent > 100
  ) {
    throw new Error('A resposta da conexão Mercado Pago é inválida.');
  }
  return body;
}

export async function startMercadoPagoConnection() {
  const body = await authenticatedRequest('/payments/mercado-pago/connect', {
    method: 'POST',
  });
  if (!body || typeof body.authorizationUrl !== 'string') {
    throw new Error('A resposta de conexão Mercado Pago é inválida.');
  }
  let url;
  try {
    url = new URL(body.authorizationUrl);
  } catch {
    throw new Error('O endereço de conexão Mercado Pago é inválido.');
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'auth.mercadopago.com'
  ) {
    throw new Error('O endereço de conexão Mercado Pago é inválido.');
  }
  return url.toString();
}

export async function createRentCheckout({ contractId, period }) {
  const body = await authenticatedRequest('/payments/checkout', {
    method: 'POST',
    body: { contractId, period },
  });
  if (
    !body ||
    typeof body.checkoutUrl !== 'string' ||
    typeof body.transactionId !== 'string'
  ) {
    throw new Error('A resposta de checkout Mercado Pago é inválida.');
  }
  let url;
  try {
    url = new URL(body.checkoutUrl);
  } catch {
    throw new Error('O endereço do checkout Mercado Pago é inválido.');
  }
  if (
    url.protocol !== 'https:' ||
    !(
      url.hostname === 'mercadopago.com' ||
      url.hostname.endsWith('.mercadopago.com') ||
      url.hostname.endsWith('.mercadopago.com.br')
    )
  ) {
    throw new Error('O endereço do checkout Mercado Pago é inválido.');
  }
  return { transactionId: body.transactionId, checkoutUrl: url.toString() };
}

export async function getPaymentTransactionStatus(transactionId) {
  const body = await authenticatedRequest(
    `/payments/${encodeURIComponent(transactionId)}`,
  );
  if (
    !body ||
    typeof body.id !== 'string' ||
    typeof body.description !== 'string' ||
    !Number.isSafeInteger(body.amountInCents) ||
    !paymentStatuses.has(body.status) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
    (body.rentAmountInCents !== null &&
      (!Number.isSafeInteger(body.rentAmountInCents) ||
        body.rentAmountInCents < 0)) ||
    (body.platformFeeInCents !== null &&
      (!Number.isSafeInteger(body.platformFeeInCents) ||
        body.platformFeeInCents < 0)) ||
    (body.paymentMethod !== null &&
      !Object.prototype.hasOwnProperty.call(paymentMethods, body.paymentMethod)) ||
    (body.paidAt !== null &&
      (typeof body.paidAt !== 'string' || Number.isNaN(Date.parse(body.paidAt))))
  ) {
    throw new Error('A resposta de status do pagamento é inválida.');
  }
  return body;
}

export async function getUserById(userId) {
  const body = await request(`/users/${encodeURIComponent(userId)}`);

  if (
    !body ||
    body.userId !== userId ||
    typeof body.name !== 'string' ||
    (body.photoUrl !== null && typeof body.photoUrl !== 'string')
  ) {
    throw new Error('A resposta do perfil do usuário é inválida.');
  }

  return {
    userId: body.userId,
    name: body.name,
    photoUrl: body.photoUrl,
  };
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

export async function confirmEmailVerification(token) {
  await request('/email-verification/confirm', {
    method: 'POST',
    body: { token },
  });
}

export async function resendEmailVerification(email) {
  await request('/email-verification/resend', {
    method: 'POST',
    body: { email },
  });
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
