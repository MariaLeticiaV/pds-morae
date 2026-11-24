const STORAGE_KEY = 'morae.demoListings';

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


const STATUS_STORAGE_KEY = 'morae.demoListingStatuses';

export function getDemoListingStatuses() {
  try {
    const value = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

export function setDemoListingStatus(id, status) {
  if (!id || !['active', 'archived', 'deleted'].includes(status)) return;
  const statuses = getDemoListingStatuses();
  statuses[id] = status;
  try {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses));
  } catch {
    // O estado permanece disponível na sessão atual.
  }
}
