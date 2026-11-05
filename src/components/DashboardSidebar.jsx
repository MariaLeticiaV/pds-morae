import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { LineIcon } from './LineIcon.jsx';
import { getDemoUser } from '../utils/demoUser.js';
import { OwnerSidebar } from '../pages/OwnerDashboardPage.jsx';
import './DashboardSidebar.css';

const menuItems = [
  { id: 'home', label: 'Início', to: '/', icon: 'home' },
  { id: 'search', label: 'Buscar vagas', to: '/buscar', icon: 'search' },
  { id: 'announce', label: 'Anunciar imóvel', to: '/anunciar', icon: 'homeGroup' },
  { id: 'messages', label: 'Minhas Mensagens', to: '/mensagens', icon: 'message' },
  { id: 'favorites', label: 'Meus Favoritos', to: '/buscar?favoritos=1', icon: 'heart' },
  { id: 'profile', label: 'Meu Perfil', to: '/perfil', icon: 'user' },
];

function getActiveItem(pathname, search) {
  if (pathname === '/buscar') return new URLSearchParams(search).get('favoritos') === '1' ? 'favorites' : 'search';
  if (pathname.startsWith('/usuarios/')) return 'search';
  if (pathname === '/anunciar') return 'announce';
  if (pathname === '/mensagens') return 'messages';
  if (pathname === '/perfil') return 'profile';
  return 'home';
}

export function DashboardSidebar({ active }) {
  const { pathname, search } = useLocation();
  const role = getDemoUser()?.role;
  if (role === 'proprietario' || role === 'ofertante') {
    return <OwnerSidebar pathname={pathname} role={role} />;
  }
  const currentItem = active ?? getActiveItem(pathname, search);

  return (
    <aside className="dashboard-sidebar">
      <Link className="dashboard-brand" to="/" aria-label="Moraê, voltar ao início"><Logo /></Link>
      <nav className="dashboard-nav" aria-label="Menu principal">
        {menuItems.map((item) => {
          const selected = currentItem === item.id;
          return (
            <Link
              key={item.id}
              className={selected ? 'selected' : ''}
              to={item.to}
              aria-current={selected ? 'page' : undefined}
            >
              <LineIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-note"><LineIcon name="shield" size={19} /><p>Busque com mais tranquilidade. Converse com anunciantes verificados.</p></div>
      <span className="sidebar-version">Moraê · Maceió, AL</span>
    </aside>
  );
}
