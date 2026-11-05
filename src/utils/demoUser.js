const STORAGE_KEY = 'morae.demoUser';

export function getDemoUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return user && typeof user.name === 'string' && user.name.trim() ? user : null;
  } catch {
    return null;
  }
}

export function saveDemoUser(name, role, profile = {}) {
  const normalizedName = String(name ?? '').trim();
  if (!normalizedName) return;

  try {
    const savedProfile = Object.fromEntries(Object.entries(profile ?? {}).filter(([key, value]) => {
      if (/password|document|proof|photos/i.test(key)) return false;
      return ['string', 'number', 'boolean'].includes(typeof value)
        || (Array.isArray(value) && value.every((item) => ['string', 'number', 'boolean'].includes(typeof item)));
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: normalizedName, role, profile: savedProfile }));
    localStorage.setItem(`morae.profile.${role || 'estudante'}`, JSON.stringify(savedProfile));
  } catch {
    // The demo can continue even if browser storage is unavailable.
  }
}
