import { Link, useLocation } from 'react-router-dom';
import { AccountMenu } from './AccountMenu.jsx';
import './TopbarAccount.css';

// Canto direito do topo das páginas do painel. Com sessão, mostra o menu da
// conta; sem sessão, os links de entrar e cadastrar (nunca um nome padrão).
export function TopbarAccount({ session }) {
  const location = useLocation();

  if (!session) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return (
      <div className="topbar-guest">
        <Link className="topbar-guest-login" to="/login" state={{ from }}>Entrar</Link>
        <Link className="topbar-guest-signup" to="/cadastro">Cadastrar-se</Link>
      </div>
    );
  }

  const firstName = session.name.trim().split(/\s+/)[0] || session.name;
  const initial = firstName.charAt(0).toLocaleUpperCase('pt-BR');

  return (
    <AccountMenu className="profile-menu" label={`Menu da conta de ${session.name}`}>
      <span className="profile-avatar">{initial}</span>
      <span className="account-menu-user-name">Olá, {firstName}</span>
      <span className="chevron" aria-hidden="true" />
    </AccountMenu>
  );
}
