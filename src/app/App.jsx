import { Link, Route, Routes } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { PlaceholderPage } from '../pages/PlaceholderPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Moraê, página inicial">
          <Logo />
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link className="active" to="/">Início</Link>
          <a href="/#como-funciona">Como funciona</a>
          <Link to="/buscar">Buscar vagas</Link>
          <Link to="/anunciar">Anunciar imóvel</Link>
          <Link to="/login" className="login-link">Entrar</Link>
          <Link to="/cadastro" className="signup-link">Cadastrar-se</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </main>
      <footer className="site-footer">Moraê <span>•</span> Moradia estudantil em Maceió</footer>
    </div>
  );
}
