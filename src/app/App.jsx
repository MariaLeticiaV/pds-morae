import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { PlaceholderPage } from '../pages/PlaceholderPage.jsx';
import { SearchPage } from '../pages/SearchPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { PasswordRecoveryPage } from '../pages/PasswordRecoveryPage.jsx';
import { PasswordResetPage } from '../pages/PasswordResetPage.jsx';
import { SignupPage } from '../pages/SignupPage.jsx';
import { UserProfilePage } from '../pages/UserProfilePage.jsx';
import { ReviewExperiencePage } from '../pages/ReviewExperiencePage.jsx';
import { MyProfilePage } from '../pages/MyProfilePage.jsx';
import { MessagesPage } from '../pages/MessagesPage.jsx';
import { AnnouncePropertyPage } from '../pages/AnnouncePropertyPage.jsx';
import { OwnerDashboardPage } from '../pages/OwnerDashboardPage.jsx';
import { PropertyDetailPage } from '../pages/PropertyDetailPage.jsx';
import { AdminPanelPage } from '../pages/AdminPanelPage.jsx';
import { RentPaymentPage } from '../pages/RentPaymentPage.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isSearchPage = pathname === '/buscar';
  const isLoginPage = pathname === '/login';
  const isPasswordRecoveryPage = pathname === '/recuperar-senha';
  const isPasswordResetPage = pathname === '/redefinir-senha';
  const isAuthPage = isLoginPage || isPasswordRecoveryPage || isPasswordResetPage;
  const isSignupPage = pathname === '/cadastro';
  const isMessagesPage = pathname === '/mensagens';
  const isAnnouncePage = pathname === '/anunciar';
  const isOwnerPage = pathname.startsWith('/proprietario');
  const isOffererPage = pathname.startsWith('/ofertante');
  const isPropertyDetailPage = pathname.startsWith('/imoveis/');
  const isUserProfilePage = pathname === '/perfil' || pathname.startsWith('/usuarios/');
  const isAdminPage = pathname.startsWith('/admin');
  const isRentPaymentPage = pathname === '/pagamento-aluguel';
  const isReviewPage = pathname === '/avaliar-moradia';
  const isStandalonePage = isSearchPage || isAuthPage || isSignupPage || isUserProfilePage || isMessagesPage || isAnnouncePage || isOwnerPage || isOffererPage || isPropertyDetailPage || isAdminPage || isRentPaymentPage || isReviewPage;

  return (
    <div className={`app-shell${isSearchPage || isUserProfilePage || isMessagesPage || isAnnouncePage || isOwnerPage || isOffererPage || isPropertyDetailPage || isReviewPage ? ' dashboard-app' : ''}${isMessagesPage ? ' messages-app' : ''}${isAnnouncePage ? ' announce-app' : ''}${isAuthPage ? ' auth-app' : ''}${isSignupPage ? ' signup-app' : ''}${isAdminPage ? ' admin-app' : ''}`}>
      {!isSearchPage && !isUserProfilePage && !isMessagesPage && !isAnnouncePage && !isOwnerPage && !isOffererPage && !isPropertyDetailPage && !isAdminPage && !isRentPaymentPage && !isReviewPage && <header className="site-header">
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
          <Route path="/imoveis/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminPanelPage />} />
          <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
          <Route path="/redefinir-senha" element={<PasswordResetPage />} />
          <Route path="/cadastro" element={<SignupPage />} />
          <Route path="/mensagens" element={<MessagesPage />} />
          <Route path="/pagamento-aluguel" element={<RentPaymentPage />} />
          <Route path="/anunciar" element={<AnnouncePropertyPage />} />
          <Route path="/proprietario/*" element={<OwnerDashboardPage />} />
          <Route path="/ofertante/*" element={<OwnerDashboardPage role="ofertante" />} />
          <Route path="/perfil" element={<MyProfilePage />} />
          <Route path="/usuarios/:id" element={<UserProfilePage />} />
          <Route path="/avaliar-moradia" element={<ReviewExperiencePage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </main>
      {!isStandalonePage && <footer className="site-footer">Moraê <span>•</span> Moradia estudantil em Maceió</footer>}
    </div>
  );
}
