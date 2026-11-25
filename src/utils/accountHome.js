// Página inicial de cada tipo de conta, usada depois do login e no menu da conta.
export function homeForAccountType(accountType) {
  if (accountType === 'PROPERTY_OWNER') return '/proprietario';
  if (accountType === 'STUDENT_OFFERER') return '/ofertante';
  if (accountType === 'ADMINISTRATOR') return '/admin';
  return '/buscar';
}

// Atalhos do menu da conta no cabeçalho do site, conforme o tipo de conta.
export function accountMenuItems(accountType) {
  const items = [];
  if (accountType === 'PROPERTY_OWNER' || accountType === 'STUDENT_OFFERER') {
    items.push({ to: homeForAccountType(accountType), label: 'Meu painel' });
  } else {
    items.push({ to: '/buscar?favoritos=1', label: 'Meus favoritos' });
  }
  items.push({ to: '/mensagens', label: 'Minhas mensagens' });
  return items;
}
