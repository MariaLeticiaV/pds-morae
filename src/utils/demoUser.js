const STORAGE_KEY = 'morae.demoUser';

export function getDemoUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return user && typeof user.name === 'string' && user.name.trim() ? user : null;
  } catch {
    return null;
  }
}

export function saveDemoUser(name, role) {
  const normalizedName = String(name ?? '').trim();
  if (!normalizedName) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: normalizedName, role }));
  } catch {
    // The demo can continue even if browser storage is unavailable.
  }
}
