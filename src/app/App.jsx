import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { PlaceholderPage } from '../pages/PlaceholderPage.jsx';
import { SearchPage } from '../pages/SearchPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { SignupPage } from '../pages/SignupPage.jsx';
import { UserProfilePage } from '../pages/UserProfilePage.jsx';
import { MyProfilePage } from '../pages/MyProfilePage.jsx';
import { MessagesPage } from '../pages/MessagesPage.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isSearchPage = pathname === '/buscar';
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/cadastro';
  const isMessagesPage = pathname === '/mensagens';
  const isUserProfilePage = pathname === '/perfil' || pathname.startsWith('/usuarios/');
  const isStandalonePage = isSearchPage || isLoginPage || isSignupPage || isUserProfilePage || isMessagesPage;

  return (
    <div className={`app-shell${isSearchPage || isUserProfilePage || isMessagesPage ? ' dashboard-app' : ''}${isLoginPage ? ' auth-app' : ''}${isSignupPage ? ' signup-app' : ''}`}>
      {!isSearchPage && !isUserProfilePage && !isMessagesPage && <header className="site-header">
        <Link className="brand" to="/" aria-label="Moraê, página inicial">
          <Logo />
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link className={pathname === '/' ? 'active' : ''} to="/">Início</Link>
          <a href="/#como-funciona">Como funciona</a>
          <Link to="/buscar">Buscar vagas</Link>
          <Link to="/anunciar">Anunciar imóvel</Link>
          <Link to="/login" className="login-link">Entrar</Link>
          <Link to="/cadastro" className="signup-link">Cadastrar-se</Link>
        </nav>
      </header>}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignupPage />} />
          <Route path="/mensagens" element={<MessagesPage />} />
          <Route path="/perfil" element={<MyProfilePage />} />
          <Route path="/usuarios/:id" element={<UserProfilePage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </main>
      {!isStandalonePage && <footer className="site-footer">Moraê <span>•</span> Moradia estudantil em Maceió</footer>}
    </div>
  );
}
