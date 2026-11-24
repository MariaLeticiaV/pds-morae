const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const housingTypeLabels = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  ROOM: 'Quarto',
  REPUBLIC: 'República',
};

const amenityLabels = {
  WIFI: 'WI-FI',
  FURNISHED: 'Mobiliado',
  PARKING: 'Estacionamento',
  LAUNDRY: 'Lavanderia',
  PETS_ALLOWED: 'Aceita pets',
};

async function request(path) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error(`Não foi possível conectar à API em ${API_URL}.`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || 'Não foi possível carregar os anúncios.');
  }

  return body;
}

export async function searchListings(location = '') {
  const query = new URLSearchParams();
  if (location.trim()) query.set('location', location.trim());
  const suffix = query.size ? `?${query.toString()}` : '';
  const result = await request(`/properties${suffix}`);
  if (!Array.isArray(result)) throw new Error('A API retornou uma lista de anúncios inválida.');
  return result.map(normalizeListing);
}

export async function getListing(listingId) {
  const result = await request(`/properties/${encodeURIComponent(listingId)}`);
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('A API retornou um anúncio inválido.');
  }
  return normalizeListing(result);
}

function normalizeListing(listing) {
  const neighborhood = listing.location?.neighborhood || '';
  const city = listing.location?.city || 'Maceió';
  const state = listing.location?.state || 'AL';
  const imageUrl = listing.media?.find((media) => media.type === 'PHOTO')?.url || '';
  const housingType = housingTypeLabels[listing.housingType] || listing.housingType || 'Imóvel';
  const amenities = (listing.amenities || []).map((item) => amenityLabels[item] || item);

  return {
    id: listing.listingId,
    listingId: listing.listingId,
    propertyId: listing.propertyId,
    name: listing.title,
    title: listing.title,
    description: listing.description || '',
    neighborhood,
    city,
    state,
    price: Number(listing.rent) || 0,
    rent: Number(listing.rent) || 0,
    type: housingType,
    housingType: listing.housingType,
    rooms: Number(listing.bedrooms) || 0,
    bedrooms: Number(listing.bedrooms) || 0,
    baths: Number(listing.bathrooms) || 0,
    bathrooms: Number(listing.bathrooms) || 0,
    distance: `${neighborhood} · ${city}/${state}`,
    tags: amenities,
    amenities,
    host: listing.advertiser?.name || 'Anunciante',
    hostId: listing.advertiser?.userId || '',
    profileId: listing.advertiser?.userId || '',
    profileName: listing.advertiser?.name || 'Anunciante',
    hostRole: 'Anunciante',
    imageUrl,
    scene: 'flat',
  };
}
