const USER_SESSION_KEY = 'morae-user-session';

export function saveUserSession(session) {
  const isValidSession =
    session &&
    typeof session.userId === 'string' &&
    typeof session.name === 'string' &&
    typeof session.email === 'string' &&
    typeof session.status === 'string' &&
    ['STUDENT_SEEKER', 'STUDENT_OFFERER', 'PROPERTY_OWNER', 'ADMINISTRATOR', 'OTHER'].includes(session.accountType) &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    session.tokenType === 'Bearer';

  if (!isValidSession) {
    throw new Error('A resposta de autenticação do usuário é inválida.');
  }

  const savedSession = {
    userId: session.userId,
    name: session.name,
    email: session.email,
    status: session.status,
    accountType: session.accountType,
    accessToken: session.accessToken,
    tokenType: session.tokenType,
  };
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(savedSession));
  return savedSession;
}

export function getUserSession() {
  const storedSession = sessionStorage.getItem(USER_SESSION_KEY);
  if (!storedSession) return null;

  let session;
  try {
    session = JSON.parse(storedSession);
  } catch {
    sessionStorage.removeItem(USER_SESSION_KEY);
    return null;
  }

  const isValidSession =
    session &&
    typeof session.userId === 'string' &&
    typeof session.name === 'string' &&
    typeof session.email === 'string' &&
    typeof session.status === 'string' &&
    ['STUDENT_SEEKER', 'STUDENT_OFFERER', 'PROPERTY_OWNER', 'ADMINISTRATOR', 'OTHER'].includes(session.accountType) &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    session.tokenType === 'Bearer';

  if (!isValidSession) {
    sessionStorage.removeItem(USER_SESSION_KEY);
    return null;
  }

  return session;
}

export function logoutUser() {
  sessionStorage.removeItem(USER_SESSION_KEY);
  localStorage.removeItem('morae.demoUser');
  // Sem isto, telas que só conferem o token continuariam agindo como logadas.
  localStorage.removeItem('morae.accessToken');
}
