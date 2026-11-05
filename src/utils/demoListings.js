const STORAGE_KEY = 'morae.demoListings';

const mockListings = {
  'apt-ufal': { listingTitle: 'Apartamento próximo à UFAL', cep: '57072-000', state: 'AL', street: 'Avenida Lourival Melo Mota', number: '1000', complement: 'Bloco A', city: 'Maceió', neighborhood: 'Clima Bom', propertyType: 'Apartamento', rooms: '2', bathrooms: '1', parking: '1', description: 'Apartamento próximo à UFAL, com quarto individual e estrutura para uma convivência confortável.', amenities: ['WI-FI', 'Mobiliado'], rent: '600', condominium: '0', minimumStay: '6 meses', rules: '' },
  'casa-farol': { listingTitle: 'Casa compartilhada no Farol', cep: '57051-000', state: 'AL', street: 'Rua Professor Sandoval Arroxelas', number: '150', complement: '', city: 'Maceió', neighborhood: 'Farol', propertyType: 'Casa', rooms: '3', bathrooms: '2', parking: '1', description: 'Casa compartilhada no Farol, com ambientes mobiliados e acesso conveniente a serviços e transporte.', amenities: ['WI-FI', 'Cozinha equipada'], rent: '700', condominium: '', minimumStay: '6 meses', rules: 'Manter os espaços comuns organizados.' },
  'kitnet-ponta-verde': { listingTitle: 'Kitnet mobiliada na Ponta Verde', cep: '57035-000', state: 'AL', street: 'Rua Deputado José Lages', number: '80', complement: '', city: 'Maceió', neighborhood: 'Ponta Verde', propertyType: 'Apartamento', rooms: '1', bathrooms: '1', parking: '0', description: 'Kitnet mobiliada em uma das regiões mais acessíveis de Maceió.', amenities: ['WI-FI', 'Mobiliado'], rent: '950', condominium: '', minimumStay: '3 meses', rules: '' },
  'vaga-village': { listingTitle: 'Apartamento compartilhado – Village', cep: '57072-000', state: 'AL', street: 'Avenida Menino Marcelo', number: '2500', complement: '', city: 'Maceió', neighborhood: 'Village Campestre', propertyType: 'Apartamento', rooms: '2', bathrooms: '1', parking: '1', description: 'Vaga em apartamento compartilhado, ideal para estudante que busca dividir as despesas e a rotina.', amenities: ['WI-FI', 'Mobiliado'], rent: '500', condominium: '', minimumStay: '6 meses', rules: 'Respeitar os horários de silêncio.' },
  'vaga-farol': { listingTitle: 'Casa compartilhada no Farol', cep: '57051-000', state: 'AL', street: 'Rua Professor Sandoval Arroxelas', number: '150', complement: '', city: 'Maceió', neighborhood: 'Farol', propertyType: 'Casa', rooms: '3', bathrooms: '2', parking: '1', description: 'Vaga em casa compartilhada, com quarto individual e espaços comuns mobiliados.', amenities: ['WI-FI', 'Cozinha equipada'], rent: '700', condominium: '', minimumStay: '6 meses', rules: 'Manter os espaços comuns organizados.' },
};

function readListings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

export function getDemoListing(id) {
  if (!id) return null;
  return { ...(mockListings[id] ?? {}), ...(readListings()[id] ?? {}) };
}

export function saveDemoListing(id, listing) {
  if (!id) return;
  const listings = readListings();
  listings[id] = listing;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(listings)); }
  catch { /* A edição continua disponível nesta sessão mesmo sem armazenamento local. */ }
}
