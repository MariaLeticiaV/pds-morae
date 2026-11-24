import { getUserSession, saveUserSession } from './userAuth.js';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'morae.accessToken';

// Fotos enviadas ao servidor voltam como caminho relativo à API
// ("/uploads/listings/..."). Como o front e a API ficam em endereços
// diferentes, o caminho precisa do endereço da API na frente.
export function resolveMediaUrl(url) {
  if (typeof url !== 'string' || url === '') return '';
  return url.startsWith('/uploads/') ? `${API_URL}${url}` : url;
}

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_LISTING_PHOTOS = 10;

// Mesmas regras do backend, para avisar antes do envio.
export function validateImageFile(file) {
  if (!file || !ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return 'Use somente imagens JPEG, PNG ou WEBP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `A imagem "${file.name}" passa de 5 MB.`;
  }
  return null;
}


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
  const isMultipartBody = typeof FormData !== 'undefined' && body instanceof FormData;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(body === undefined || isMultipartBody
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...(body === undefined
        ? {}
        : { body: isMultipartBody ? body : JSON.stringify(body) }),
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
      const error = new Error(unauthorizedMessage);
      error.status = 401;
      throw error;
    }

    const message = Array.isArray(result?.message)
      ? result.message.join(' ')
      : result?.message;

    throw new Error(message || 'Não foi possível concluir a solicitação.');
  }

  return result;
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
    !['STUDENT_SEEKER', 'STUDENT_OFFERER', 'PROPERTY_OWNER', 'ADMINISTRATOR', 'OTHER'].includes(body.accountType) ||
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

export function getGoogleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export async function completeGoogleLogin(code) {
  if (typeof code !== 'string' || code.length === 0 || code.length > 256) {
    throw new Error('O código de autenticação do Google é inválido.');
  }
  const session = await request('/auth/google/exchange', {
    method: 'POST',
    body: { code },
  });
  if (
    !session ||
    typeof session.userId !== 'string' ||
    typeof session.name !== 'string' ||
    typeof session.email !== 'string' ||
    typeof session.status !== 'string' ||
    !['STUDENT_SEEKER', 'STUDENT_OFFERER', 'PROPERTY_OWNER', 'ADMINISTRATOR', 'OTHER'].includes(session.accountType) ||
    typeof session.accessToken !== 'string' ||
    session.accessToken.length === 0 ||
    session.tokenType !== 'Bearer'
  ) {
    throw new Error('A resposta de autenticação do Google é inválida.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  saveUserSession(session);
  return session;
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

const interestStatuses = new Set([
  'PENDING',
  'IN_CONVERSATION',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

function mapInterestReceipt(interest) {
  if (
    !interest ||
    typeof interest.listingId !== 'string' ||
    !interestStatuses.has(interest.status) ||
    typeof interest.createdAt !== 'string' ||
    Number.isNaN(Date.parse(interest.createdAt)) ||
    typeof interest.updatedAt !== 'string' ||
    Number.isNaN(Date.parse(interest.updatedAt))
  ) {
    throw new Error('A resposta da manifestação de interesse é inválida.');
  }
  return interest;
}

function mapListing(listing) {
  if (
    !listing ||
    typeof listing.listingId !== 'string' ||
    typeof listing.title !== 'string' ||
    typeof listing.description !== 'string' ||
    !Number.isFinite(listing.rent) ||
    typeof listing.housingType !== 'string' ||
    !Number.isInteger(listing.bedrooms) ||
    !Number.isInteger(listing.bathrooms) ||
    !Array.isArray(listing.amenities) ||
    !listing.amenities.every((amenity) => typeof amenity === 'string') ||
    !listing.location ||
    typeof listing.location.neighborhood !== 'string' ||
    typeof listing.location.city !== 'string' ||
    typeof listing.location.state !== 'string' ||
    !listing.advertiser ||
    typeof listing.advertiser.userId !== 'string' ||
    typeof listing.advertiser.name !== 'string' ||
    !Array.isArray(listing.media)
  ) {
    throw new Error('A resposta do anúncio é inválida.');
  }

  return {
    ...listing,
    media: listing.media.map((item) => {
      if (
        !item ||
        typeof item.url !== 'string' ||
        typeof item.type !== 'string' ||
        !Number.isInteger(item.position)
      ) {
        throw new Error('A resposta contém uma mídia de anúncio inválida.');
      }
      return { ...item, url: resolveMediaUrl(item.url) };
    }),
  };
}

export async function searchApprovedListings() {
  const body = await request('/properties');
  if (!Array.isArray(body)) {
    throw new Error('A resposta da busca de anúncios é inválida.');
  }
  return body.map(mapListing);
}

export async function getApprovedListing(listingId) {
  if (typeof listingId !== 'string' || listingId.length === 0) {
    throw new Error('O identificador do anúncio é inválido.');
  }
  return mapListing(await request(`/properties/${encodeURIComponent(listingId)}`));
}

export async function getMyInterestStatus(listingId) {
  const body = await authenticatedRequest(
    `/interests/mine/${encodeURIComponent(listingId)}`,
  );
  if (body === null) return null;
  return mapInterestReceipt(body);
}

export async function submitInterest(listingId) {
  return mapInterestReceipt(
    await authenticatedRequest(`/interests/${encodeURIComponent(listingId)}`, {
      method: 'PUT',
    }),
  );
}

export async function withdrawInterest(listingId) {
  await authenticatedRequest(`/interests/${encodeURIComponent(listingId)}`, {
    method: 'DELETE',
  });
}

export async function getReceivedInterests() {
  const body = await authenticatedRequest('/interests/received');
  if (!body || !Array.isArray(body.items)) {
    throw new Error('A resposta das manifestações recebidas é inválida.');
  }
  return body.items.map((item) => {
    if (
      !item ||
      typeof item.userId !== 'string' ||
      typeof item.listingId !== 'string' ||
      typeof item.listingTitle !== 'string' ||
      typeof item.neighborhood !== 'string' ||
      typeof item.city !== 'string' ||
      typeof item.name !== 'string' ||
      !interestStatuses.has(item.status) ||
      typeof item.interestedAt !== 'string' ||
      Number.isNaN(Date.parse(item.interestedAt))
    ) {
      throw new Error('A resposta contém uma manifestação de interesse inválida.');
    }
    return item;
  });
}

export async function updateInterestStatus(listingId, userId, status) {
  if (!['IN_CONVERSATION', 'ACCEPTED', 'REJECTED'].includes(status)) {
    throw new Error('A situação da manifestação de interesse é inválida.');
  }
  return mapInterestReceipt(
    await authenticatedRequest(
      `/interests/listings/${encodeURIComponent(listingId)}/${encodeURIComponent(userId)}/status`,
      { method: 'PATCH', body: { status } },
    ),
  );
}

function mapReview(review) {
  const ratingKeys = [
    'cleanliness',
    'condition',
    'location',
    'communication',
    'value',
    'overall',
  ];
  if (
    !review ||
    typeof review.id !== 'string' ||
    typeof review.reviewedUserId !== 'string' ||
    typeof review.listingId !== 'string' ||
    typeof review.listingTitle !== 'string' ||
    typeof review.comment !== 'string' ||
    typeof review.createdAt !== 'string' ||
    Number.isNaN(Date.parse(review.createdAt)) ||
    !ratingKeys.every((key) => Number.isInteger(review[key]) && review[key] >= 1 && review[key] <= 5)
  ) {
    throw new Error('A resposta da avaliação de moradia é inválida.');
  }
  return review;
}

export async function getUserReviews(userId) {
  const body = await request(`/reviews/users/${encodeURIComponent(userId)}`);
  if (
    !body ||
    !Array.isArray(body.items) ||
    !Number.isInteger(body.reviewCount) ||
    body.reviewCount !== body.items.length ||
    (body.averageRating !== null &&
      (!Number.isFinite(body.averageRating) || body.averageRating < 1 || body.averageRating > 5))
  ) {
    throw new Error('A resposta das avaliações do perfil é inválida.');
  }
  return {
    items: body.items.map(mapReview),
    averageRating: body.averageRating,
    reviewCount: body.reviewCount,
  };
}

export async function getEligibleReviewContracts() {
  const body = await authenticatedRequest('/reviews/eligible-contracts');
  if (!Array.isArray(body)) {
    throw new Error('A resposta dos contratos elegíveis para avaliação é inválida.');
  }
  return body.map((contract) => {
    if (
      !contract ||
      typeof contract.contractId !== 'string' ||
      typeof contract.listingId !== 'string' ||
      typeof contract.listingTitle !== 'string' ||
      typeof contract.neighborhood !== 'string' ||
      typeof contract.ownerId !== 'string' ||
      typeof contract.ownerName !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(contract.startsAt) ||
      !['ACTIVE', 'TERMINATED'].includes(contract.status)
    ) {
      throw new Error('A resposta contém um contrato elegível inválido.');
    }
    return contract;
  });
}

export async function submitHousingReview(review) {
  if (
    !review ||
    typeof review.contractId !== 'string' ||
    !['cleanliness', 'condition', 'location', 'communication', 'value', 'overall']
      .every((key) => Number.isInteger(review[key]) && review[key] >= 1 && review[key] <= 5) ||
    typeof review.comment !== 'string' ||
    review.comment.trim().length < 20 ||
    review.comment.trim().length > 1000
  ) {
    throw new Error('Preencha todos os critérios e escreva um comentário entre 20 e 1.000 caracteres.');
  }
  return mapReview(await authenticatedRequest('/reviews', {
    method: 'POST',
    body: { ...review, comment: review.comment.trim() },
  }));
}

export async function submitReport(report) {
  const categories = [
    'FRAUD',
    'HARASSMENT',
    'INAPPROPRIATE_CONTENT',
    'SAFETY',
    'OTHER',
  ];
  const hasUserTarget = typeof report?.targetUserId === 'string';
  const hasListingTarget = typeof report?.listingId === 'string';
  if (
    hasUserTarget === hasListingTarget ||
    !categories.includes(report.category) ||
    typeof report.description !== 'string' ||
    report.description.trim().length < 20 ||
    report.description.trim().length > 2000
  ) {
    throw new Error('Selecione o motivo e descreva a denúncia com pelo menos 20 caracteres.');
  }
  const body = await authenticatedRequest('/reports', {
    method: 'POST',
    body: {
      ...(hasUserTarget ? { targetUserId: report.targetUserId } : {}),
      ...(hasListingTarget ? { listingId: report.listingId } : {}),
      category: report.category,
      description: report.description.trim(),
    },
  });
  if (!body || typeof body.id !== 'string' || body.status !== 'OPEN') {
    throw new Error('A resposta do registro da denúncia é inválida.');
  }
  return body;
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

const contractDocumentTypes = new Set([
  'SIGNED_CONTRACT',
  'IDENTITY_DOCUMENT',
  'PROOF_OF_ADDRESS',
  'OTHER',
]);
const contractDocumentMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

function mapContractDocument(document) {
  if (
    !document ||
    typeof document.id !== 'string' ||
    typeof document.contractId !== 'string' ||
    typeof document.originalName !== 'string' ||
    !contractDocumentMimeTypes.has(document.mimeType) ||
    !Number.isInteger(document.sizeBytes) ||
    document.sizeBytes < 1 ||
    !contractDocumentTypes.has(document.documentType) ||
    typeof document.createdAt !== 'string' ||
    Number.isNaN(Date.parse(document.createdAt)) ||
    typeof document.uploadedByName !== 'string'
  ) {
    throw new Error('A resposta do documento do contrato é inválida.');
  }
  return document;
}

export async function getContractDocuments(contractId) {
  const body = await authenticatedRequest(
    `/rental-contracts/${encodeURIComponent(contractId)}/documents`,
  );
  if (!Array.isArray(body)) {
    throw new Error('A resposta dos documentos do contrato é inválida.');
  }
  return body.map(mapContractDocument);
}

export async function uploadContractDocument(contractId, file, documentType) {
  if (
    !file ||
    !contractDocumentTypes.has(documentType) ||
    file.size < 1 ||
    file.size > 10 * 1024 * 1024
  ) {
    throw new Error('Selecione um arquivo válido de até 10 MB e informe o tipo do documento.');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  return mapContractDocument(await authenticatedRequest(
    `/rental-contracts/${encodeURIComponent(contractId)}/documents`,
    { method: 'POST', body: formData },
  ));
}

export async function downloadContractDocument(contractId, documentId) {
  const token = getAuthenticatedToken();
  let response;
  try {
    response = await fetch(
      `${API_URL}/rental-contracts/${encodeURIComponent(contractId)}/documents/${encodeURIComponent(documentId)}/download`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Não foi possível conectar à API em ${API_URL}.`);
    }
    throw error;
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message;
    throw new Error(message || 'Não foi possível acessar este documento.');
  }
  return response.blob();
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

// GET /users/:id exige login no backend.
export async function getUserById(userId, token = getAccessToken()) {
  const body = await request(`/users/${encodeURIComponent(userId)}`, {
    token,
    unauthorizedMessage: 'Entre na sua conta para ver o perfil de outros usuários.',
  });

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
    photoUrl: resolveMediaUrl(body.photoUrl) || null,
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

export function listCompatibleStudents(
  { limit, minScore } = {},
  token = getAccessToken(),
) {
  if (!token) {
    throw new Error('Faça login para ver pessoas compatíveis com você.');
  }

  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (minScore !== undefined) params.set('minScore', String(minScore));
  const query = params.toString();

  return request(`/matching/recommendations${query ? `?${query}` : ''}`, {
    token,
    unauthorizedMessage: 'Sua sessão expirou. Entre novamente para ver pessoas compatíveis.',
  });
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

// ---------------------------------------------------------------------------
// Conta do usuário logado

function mapMyAccount(body) {
  if (
    !body ||
    typeof body.userId !== 'string' ||
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    !(body.phone === null || typeof body.phone === 'string') ||
    typeof body.emailVerified !== 'boolean'
  ) {
    throw new Error('A resposta dos dados da conta é inválida.');
  }
  return {
    userId: body.userId,
    name: body.name,
    email: body.email,
    phone: body.phone,
    photoUrl: resolveMediaUrl(body.photoUrl) || null,
    emailVerified: body.emailVerified,
    status: body.status,
    role: body.role,
    profileData: body.profileData && typeof body.profileData === 'object' ? body.profileData : {},
  };
}

export async function getMyAccount() {
  return mapMyAccount(await authenticatedRequest('/users/me'));
}

export async function uploadMyPhoto(file) {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);
  const form = new FormData();
  form.append('photo', file);
  return mapMyAccount(
    await authenticatedRequest('/users/me/photo', { method: 'PUT', body: form }),
  );
}

export async function removeMyPhoto() {
  return mapMyAccount(
    await authenticatedRequest('/users/me/photo', { method: 'DELETE' }),
  );
}

const listingStatuses = new Set(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED', 'REMOVED']);

// Resposta das rotas de fotos: { status, photos }. Adicionar fotos a um
// anúncio aprovado ou arquivado o devolve para a moderação (PENDING).
function mapListingPhotos(body) {
  const photos = body?.photos;
  if (
    !body ||
    !listingStatuses.has(body.status) ||
    !Array.isArray(photos) ||
    !photos.every(
      (photo) =>
        photo &&
        typeof photo.id === 'string' &&
        typeof photo.url === 'string' &&
        Number.isInteger(photo.position),
    )
  ) {
    throw new Error('A resposta das fotos do anúncio é inválida.');
  }
  return {
    status: body.status,
    photos: photos.map((photo) => ({ ...photo, url: resolveMediaUrl(photo.url) })),
  };
}

function listingPhotosPath(listingId) {
  return `/properties/${encodeURIComponent(listingId)}/photos`;
}

export async function getListingPhotos(listingId) {
  return mapListingPhotos(await authenticatedRequest(listingPhotosPath(listingId)));
}

export async function addListingPhotos(listingId, files) {
  const list = Array.from(files ?? []);
  if (list.length === 0) throw new Error('Selecione ao menos uma foto.');
  const problem = list.map(validateImageFile).find(Boolean);
  if (problem) throw new Error(problem);
  const form = new FormData();
  list.forEach((file) => form.append('photos', file));
  return mapListingPhotos(
    await authenticatedRequest(listingPhotosPath(listingId), { method: 'POST', body: form }),
  );
}

export async function removeListingPhoto(listingId, photoId) {
  return mapListingPhotos(
    await authenticatedRequest(
      `${listingPhotosPath(listingId)}/${encodeURIComponent(photoId)}`,
      { method: 'DELETE' },
    ),
  );
}

export async function reorderListingPhotos(listingId, photoIds) {
  return mapListingPhotos(
    await authenticatedRequest(`${listingPhotosPath(listingId)}/order`, {
      method: 'PUT',
      body: { photoIds },
    }),
  );
}

// Envie só os campos alterados: name, email, cpf e/ou phone (null apaga o telefone).
export async function updateMyAccount(changes) {
  return mapMyAccount(
    await authenticatedRequest('/users/me', { method: 'PATCH', body: changes }),
  );
}

// Perfil completo (dados pessoais, acadêmicos e preferências).
// O próprio perfil traz também o bloco `private` (e-mail, telefone, nascimento...).
// A foto de perfil pode vir como caminho relativo à API (/uploads/users/...).
function withResolvedPhoto(view) {
  return view && typeof view.photoUrl === 'string'
    ? { ...view, photoUrl: resolveMediaUrl(view.photoUrl) }
    : view;
}

export async function getMyProfile() {
  return withResolvedPhoto(await authenticatedRequest('/users/me/profile'));
}

// O endpoint de estudante mantém as respostas estruturadas usadas na comparação
// de compatibilidade. Também serve como fallback para versões da API sem /users/me/profile.
export async function getMyStudentProfile() {
  return authenticatedRequest('/students/me');
}

export async function getUserProfile(userId) {
  return withResolvedPhoto(
    await authenticatedRequest(`/users/${encodeURIComponent(userId)}/profile`),
  );
}

// Envie só o que mudou: { details?, course?, period?, compatibilityAnswers? }.
// Em details, null ou "" apaga o valor.
export async function updateMyProfile(changes) {
  return withResolvedPhoto(
    await authenticatedRequest('/users/me/profile', { method: 'PATCH', body: changes }),
  );
}

// ---------------------------------------------------------------------------
// Favoritos

export async function listFavoriteListingIds() {
  const body = await authenticatedRequest('/favorites');
  if (!body || !Array.isArray(body.items)) {
    throw new Error('A resposta dos favoritos é inválida.');
  }
  return body.items.map((item) => {
    if (!item || typeof item.listingId !== 'string') {
      throw new Error('A resposta contém um favorito inválido.');
    }
    return item.listingId;
  });
}

export async function addFavoriteListing(listingId) {
  await authenticatedRequest(`/favorites/${encodeURIComponent(listingId)}`, { method: 'PUT' });
}

export async function removeFavoriteListing(listingId) {
  await authenticatedRequest(`/favorites/${encodeURIComponent(listingId)}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Chat (REST). O tempo real fica em chatSocket.js.

export function getApiUrl() {
  return API_URL;
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function mapChatMessage(message) {
  if (
    !message ||
    typeof message.id !== 'string' ||
    typeof message.chatId !== 'string' ||
    typeof message.senderId !== 'string' ||
    !(message.content === null || typeof message.content === 'string') ||
    !(message.listingId === null || typeof message.listingId === 'string') ||
    !isIsoDate(message.createdAt)
  ) {
    throw new Error('A resposta contém uma mensagem inválida.');
  }
  return {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    listingId: message.listingId,
    createdAt: message.createdAt,
  };
}

function mapChat(chat) {
  if (
    !chat ||
    typeof chat.id !== 'string' ||
    !['DIRECT', 'GROUP'].includes(chat.type) ||
    !(chat.name === null || typeof chat.name === 'string') ||
    !Array.isArray(chat.participants) ||
    !Number.isInteger(chat.unreadCount) ||
    !isIsoDate(chat.lastActivityAt)
  ) {
    throw new Error('A resposta contém uma conversa inválida.');
  }
  return {
    id: chat.id,
    type: chat.type,
    name: chat.name,
    participants: chat.participants.map((participant) => {
      if (
        !participant ||
        typeof participant.userId !== 'string' ||
        typeof participant.name !== 'string' ||
        !(participant.lastReadAt === null || isIsoDate(participant.lastReadAt))
      ) {
        throw new Error('A resposta contém um participante de conversa inválido.');
      }
      return {
        userId: participant.userId,
        name: participant.name,
        photoUrl: typeof participant.photoUrl === 'string' ? participant.photoUrl : null,
        lastReadAt: participant.lastReadAt,
      };
    }),
    lastMessage: chat.lastMessage ? mapChatMessage(chat.lastMessage) : null,
    unreadCount: chat.unreadCount,
    lastActivityAt: chat.lastActivityAt,
  };
}

function mapPage(body, mapItem, errorMessage) {
  if (
    !body ||
    !Array.isArray(body.data) ||
    !(body.nextCursor === null || typeof body.nextCursor === 'string')
  ) {
    throw new Error(errorMessage);
  }
  return { items: body.data.map(mapItem), nextCursor: body.nextCursor };
}

function pageQuery({ cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listChats(page) {
  return mapPage(
    await authenticatedRequest(`/chats${pageQuery(page)}`),
    mapChat,
    'A resposta da lista de conversas é inválida.',
  );
}

export async function getChat(chatId) {
  return mapChat(await authenticatedRequest(`/chats/${encodeURIComponent(chatId)}`));
}

// Abre (ou reaproveita) a conversa direta com um usuário ou com o anunciante
// de um anúncio. Informe só um dos dois.
export async function startDirectChat({ targetUserId, listingId }) {
  return mapChat(
    await authenticatedRequest('/chats/direct', {
      method: 'POST',
      body: listingId ? { listingId } : { targetUserId },
    }),
  );
}

export async function listChatMessages(chatId, page) {
  return mapPage(
    await authenticatedRequest(
      `/chats/${encodeURIComponent(chatId)}/messages${pageQuery(page)}`,
    ),
    mapChatMessage,
    'A resposta do histórico de mensagens é inválida.',
  );
}

export async function sendChatMessage(chatId, { content, listingId } = {}) {
  return mapChatMessage(
    await authenticatedRequest(`/chats/${encodeURIComponent(chatId)}/messages`, {
      method: 'POST',
      body: {
        content: content || null,
        ...(listingId ? { listingId } : {}),
      },
    }),
  );
}

export async function markChatAsRead(chatId) {
  await authenticatedRequest(`/chats/${encodeURIComponent(chatId)}/read`, {
    method: 'POST',
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
