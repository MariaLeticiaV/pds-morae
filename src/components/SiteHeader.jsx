import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AccountMenu } from './AccountMenu.jsx';
import { Logo } from './Logo.jsx';
import { getAdministratorSession } from '../services/adminAuth.js';
import { getUserSession } from '../services/userAuth.js';
import { accountMenuItems } from '../utils/accountHome.js';

// Rotas de autenticação: o "Entrar" delas não guarda a origem, para o login
// não voltar para a própria tela de login ou de cadastro.
const AUTH_ROUTES = new Set(['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/verificar-email']);

function MenuIcon({ open }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

export function SiteHeader() {
  const location = useLocation();
  const { pathname } = location;
  const [menuOpen, setMenuOpen] = useState(false);
  // A sessão é lida a cada render: o App renderiza de novo a cada navegação,
  // então entrar ou sair (que sempre navegam) já atualiza o cabeçalho.
  const session = getUserSession();
  const adminSession = session ? null : getAdministratorSession();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const loginState = AUTH_ROUTES.has(pathname)
    ? undefined
    : { from: `${pathname}${location.search}${location.hash}` };
  const firstName = session?.name.trim().split(/\s+/)[0] || '';
  const initial = firstName.charAt(0).toLocaleUpperCase('pt-BR');

  return (
    <header className={`site-header${menuOpen ? ' menu-open' : ''}`}>
      <Link className="brand" to="/" aria-label="Moraê, página inicial">
        <Logo />
      </Link>
      <div className="header-right">
        <nav className="main-nav" id="main-nav" aria-label="Navegação principal">
          <Link className={pathname === '/' ? 'active' : ''} to="/">Início</Link>
          <a href="/#como-funciona">Como funciona</a>
          <Link to="/buscar">Buscar vagas</Link>
          <Link to="/anunciar">Anunciar imóvel</Link>
        </nav>
        <div className="header-actions">
          {session ? (
            <AccountMenu className="header-account" items={accountMenuItems(session.accountType)} label={`Menu da conta de ${session.name}`}>
              <span className="header-account-avatar" aria-hidden="true">{initial}</span>
              <span className="header-account-name">Olá, {firstName}</span>
              <span className="header-account-chevron" aria-hidden="true" />
            </AccountMenu>
          ) : adminSession ? (
            <Link to="/admin" className="signup-link">Painel administrativo</Link>
          ) : (
            <>
              <Link to="/login" state={loginState} className="login-link">Entrar</Link>
              <Link to="/cadastro" className="signup-link">Cadastrar-se</Link>
            </>
          )}
        </div>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>
    </header>
  );
}
