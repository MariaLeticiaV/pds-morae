import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import './SearchPage.css';

const properties = [
  { id: 1, name: 'Apartamento com vista para o mar', neighborhood: 'Clima Bom', price: 900, type: 'Apartamento', rooms: 2, baths: 1, distance: '1,8 km da UFAL', tags: ['WI-FI', 'Próximo à UFAL', 'Mobiliado'], host: 'Proprietário', scene: 'sea' },
  { id: 2, name: 'Casa compartilhada com quintal', neighborhood: 'Benedito Bentes', price: 850, type: 'Casa', rooms: 3, baths: 2, distance: '4,2 km da UFAL', tags: ['WI-FI', 'Próximo à UFAL', 'Mobiliado'], host: 'Proprietário', scene: 'house' },
  { id: 3, name: 'Quarto individual aconchegante', neighborhood: 'Farol', price: 600, type: 'Quarto', rooms: 1, baths: 1, distance: '3,1 km da UFAL', tags: ['WI-FI', 'Quarto individual', 'Mobiliado'], host: 'Estudante', profileId: 'ana-beatriz', profileName: 'Ana Beatriz', scene: 'room' },
  { id: 4, name: 'Quarto em apartamento no Village', neighborhood: 'Village Campestre', price: 500, type: 'Quarto', rooms: 2, baths: 1, distance: '2,5 km da UFAL', tags: ['WI-FI', 'Próximo à UFAL', 'Compartilhado'], host: 'Estudante', profileId: 'carolina-lima', profileName: 'Carolina Lima', scene: 'flat' },
];

function Icon({ name, size = 20, fill = 'none' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
    announce: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h9M9 21v-7h6v4" /><path d="M19 14v7m-3.5-3.5h7" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.2-.6L4 20l1.4-3.7A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h8M8 9h5" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    bed: <><path d="M3 18v-8M3 15h18v3M21 18v-6a3 3 0 0 0-3-3h-5v6M3 12h10" /><circle cx="7" cy="10" r="2" /></>,
    bath: <><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3ZM6 12V6a3 3 0 0 1 5.8-1" /><path d="M8 20v2M17 20v2" /></>,
    money: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5c-.7-.7-1.8-1-3.2-1-1.8 0-3 .8-3 2s1 1.8 3 2.2 3 1 3 2.3-1.2 2.2-3.2 2.2c-1.5 0-2.7-.5-3.6-1.3M12.3 6v12" /></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="9" cy="6" r="2" fill="white" /><circle cx="15" cy="12" r="2" fill="white" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.search}</svg>;
}

function PropertyIllustration({ scene }) {
  return (
    <div className={`property-photo scene-${scene}`} aria-hidden="true">
      <div className="scene-window"><span /><span /><span /><span /></div>
      <div className="scene-wall-art" />
      <div className="scene-sofa"><i /><i /><b /></div>
      <div className="scene-table" />
      <div className="scene-plant"><i /><i /><i /><b /></div>
      <span className="scene-caption">Moraê · Maceió</span>
    </div>
  );
}

function PropertyCard({ property, favorite, onFavorite }) {
  return (
    <article className="listing-card">
      <div className="listing-image-wrap">
        <PropertyIllustration scene={property.scene} />
        <span className="listing-photo-count">1 / 6</span>
        <button className={`favorite-button${favorite ? ' is-favorite' : ''}`} onClick={() => onFavorite(property.id)} aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-pressed={favorite}>
          <Icon name="heart" size={20} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="listing-content">
        <div className="listing-main-line">
          <strong>R$ {property.price}<small>/mês</small></strong>
          <span className="listing-location"><Icon name="pin" size={16} />{property.neighborhood} – Maceió/AL</span>
        </div>
        <h3>{property.name}</h3>
        <div className="listing-tags">{property.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="listing-footer"><span><Icon name="bed" size={15} /> {property.rooms} {property.rooms === 1 ? 'quarto' : 'quartos'} · {property.baths} banheiro{property.baths > 1 ? 's' : ''}</span>{property.profileId ? <Link className="host-label host-profile-link" to={`/usuarios/${property.profileId}`} aria-label={`Ver perfil de ${property.profileName}`}><Icon name="user" size={15} /><span>Anunciante<br />{property.profileName}</span></Link> : <span className="host-label"><Icon name="user" size={15} /><span>Anunciante<br />{property.host}</span></span>}</div>
      </div>
    </article>
  );
}

function MapPanel({ onViewMap }) {
  return (
    <div className="map-illustration" aria-label="Mapa ilustrativo de Maceió com regiões de imóveis">
      <div className="map-water" />
      <div className="map-coast" />
      <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-road road-four" />
      <span className="map-label map-label-center">Maceió</span><span className="map-label map-label-north">Benedito Bentes</span><span className="map-label map-label-south">Ponta Verde</span>
      {[[63, 24], [71, 34], [54, 41], [76, 45], [45, 52], [66, 57], [35, 60], [56, 68], [75, 74], [48, 82], [24, 72], [82, 60]].map(([left, top], index) => <i className="map-pin" style={{ left: `${left}%`, top: `${top}%` }} key={index}><Icon name="pin" size={14} fill="currentColor" /></i>)}
      <button className="map-view-button" onClick={onViewMap}><Icon name="map" size={16} /> Ver mapa</button>
    </div>
  );
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialCampus = searchParams.get('campus') ?? '';
  const [query, setQuery] = useState(initialCampus);
  const [location, setLocation] = useState(initialCampus);
  const [type, setType] = useState(searchParams.get('tipo') ?? 'Todos');
  const [rooms, setRooms] = useState('Qualquer');
  const [budget, setBudget] = useState(searchParams.get('orcamento') ?? '');
  const [budgetOptionsOpen, setBudgetOptionsOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [notification, setNotification] = useState('');
  const [viewMap, setViewMap] = useState(false);

  const filteredProperties = useMemo(() => properties.filter((property) => {
    const term = location.trim().toLocaleLowerCase('pt-BR');
    const matchesPlace = !term || property.neighborhood.toLocaleLowerCase('pt-BR').includes(term) || property.distance.toLocaleLowerCase('pt-BR').includes(term) || (term.includes('ufal') && true) || term.includes('maceió') || term.includes('maceio');
    const matchesType = type === 'Todos' || type === 'Qualquer tipo' || property.type === type || (type === 'República' && property.type === 'Quarto');
    const matchesBudget = !budget || property.price <= Number(budget);
    const matchesRooms = rooms === 'Qualquer' || property.rooms >= Number(rooms);
    const matchesAmenities = (!wifiOnly || property.tags.includes('WI-FI')) && (!furnishedOnly || property.tags.includes('Mobiliado'));
    const matchesFavorite = !showFavorites || favorites.includes(property.id);
    return matchesPlace && matchesType && matchesBudget && matchesRooms && matchesAmenities && matchesFavorite;
  }), [location, type, budget, rooms, wifiOnly, furnishedOnly, showFavorites, favorites]);

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function submitSearch(event) {
    event?.preventDefault();
    setLocation(query);
    setShowFavorites(false);
  }

  return (
    <div className="search-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/" aria-label="Moraê, voltar ao início"><Logo /></Link>
        <nav className="dashboard-nav" aria-label="Menu do buscador">
          <Link to="/"><Icon name="home" />Início</Link>
          <Link className={!showFavorites ? 'selected' : ''} to="/buscar" onClick={() => setShowFavorites(false)}><Icon name="search" />Buscar vagas</Link>
          <Link className="announce-nav" to="/anunciar"><Icon name="announce" />Anunciar imóvel</Link>
          <Link to="/mensagens"><Icon name="message" />Minhas Mensagens</Link>
          <button className={showFavorites ? 'selected' : ''} onClick={() => setShowFavorites(true)}><Icon name="heart" />Meus Favoritos{favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}</button>
          <Link to="/perfil"><Icon name="user" />Meu Perfil</Link>
        </nav>
        <div className="sidebar-note"><Icon name="shield" size={19} /><p>Busque com mais tranquilidade. Converse com anunciantes verificados.</p></div>
        <span className="sidebar-version">Moraê · Maceió, AL</span>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <form className="top-search" onSubmit={submitSearch}>
            <Icon name="search" size={22} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" />
            {query && <button type="button" className="clear-search" onClick={() => { setQuery(''); setLocation(''); }} aria-label="Limpar busca"><Icon name="close" size={17} /></button>}
          </form>
          <div className="topbar-actions">
            <button className="icon-button notification-button" onClick={() => setNotification((current) => current ? '' : 'Você está em dia! Não há novas notificações.')} aria-label="Notificações"><Icon name="bell" size={22} /><i /></button>
            <span className="topbar-divider" />
            <button className="profile-menu" onClick={() => setNotification('Olá, Aluno! Seu perfil ainda está em demonstração.')}><span className="profile-avatar">A</span><span>Olá, Aluno</span><span className="chevron" aria-hidden="true" /></button>
          </div>
          {notification && <div className="notification-popover"><button onClick={() => setNotification('')} aria-label="Fechar"><Icon name="close" size={15} /></button>{notification}</div>}
        </header>

        <main className="dashboard-content">
          <section className="welcome-banner">
            <div className="welcome-copy"><span className="welcome-home-icon"><Icon name="home" size={36} /></span><div><h1>Encontre o lugar ideal<br className="wide-break" /> para morar!</h1><p>Filtre por cidade, bairro, tipo de imóvel e muito mais para encontrar<br className="wide-break" /> a moradia perfeita para você.</p></div></div>
            <div className="welcome-art"><div className="brand-watermark"><Logo /></div><p>Mais que um imóvel,<br /> conexões que fazem<br /> sentido. <span>♡</span></p></div>
            <span className="banner-circle circle-pink" /><span className="banner-circle circle-green" />
          </section>

          <form className={`filter-panel${expandedFilters ? ' filters-expanded' : ''}`} onSubmit={submitSearch}>
            <label className="filter-control location-control"><span><Icon name="pin" />Localização</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cidade, bairro, universidade..." /></label>
            <label className="filter-control"><span><Icon name="home" />Tipo de imóvel</span><div className="select-control-wrap"><select value={type} onChange={(event) => setType(event.target.value)}><option>Todos</option><option>República</option><option>Quarto</option><option>Apartamento</option><option>Casa</option></select><span className="filter-chevron" aria-hidden="true" /></div></label>
            <label className="filter-control"><span><Icon name="bed" />Quartos</span><div className="select-control-wrap"><select value={rooms} onChange={(event) => setRooms(event.target.value)}><option>Qualquer</option><option value="1">1 ou mais</option><option value="2">2 ou mais</option><option value="3">3 ou mais</option></select><span className="filter-chevron" aria-hidden="true" /></div></label>
            <div className="filter-control budget-filter-control"><label className="filter-control-title" htmlFor="max-budget"><Icon name="money" />Valor máximo</label><div className="budget-input-wrap" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setBudgetOptionsOpen(false); }}><span className="currency-prefix">R$</span><input id="max-budget" type="number" min="0" step="50" inputMode="numeric" value={budget} onFocus={() => setBudgetOptionsOpen(true)} onChange={(event) => setBudget(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setBudgetOptionsOpen(false); if (event.key === 'ArrowDown') { event.preventDefault(); setBudgetOptionsOpen(true); } }} placeholder="Qualquer valor" aria-label="Valor máximo em reais" aria-haspopup="listbox" aria-controls="budget-options-list" aria-expanded={budgetOptionsOpen} /><button className="budget-dropdown-toggle" type="button" onClick={() => setBudgetOptionsOpen((open) => !open)} aria-label="Mostrar sugestões de valor" aria-expanded={budgetOptionsOpen}><span className="filter-chevron" aria-hidden="true" /></button>{budgetOptionsOpen && <div id="budget-options-list" className="budget-options" role="listbox" aria-label="Sugestões de valor máximo">{[['500', 'Até R$ 500'], ['600', 'Até R$ 600'], ['850', 'Até R$ 850'], ['1200', 'Até R$ 1.200'], ['2000', 'Até R$ 2.000'], ['', 'Sem limite']].map(([value, label]) => <button className={budget === value ? 'budget-option chosen' : 'budget-option'} type="button" role="option" aria-selected={budget === value} key={label} onMouseDown={(event) => event.preventDefault()} onClick={() => { setBudget(value); setBudgetOptionsOpen(false); }}>{label}</button>)}</div>}</div></div>
            <button className="apply-filters" type="submit"><Icon name="search" size={21} />Buscar</button>
            <button className="more-filters" type="button" aria-expanded={expandedFilters} onClick={() => setExpandedFilters((value) => !value)}><Icon name="filter" size={20} />Mais filtros <span className="more-chevron" aria-hidden="true" /></button>
            {expandedFilters && <div className="extra-filter-options"><label><input type="checkbox" checked={wifiOnly} onChange={(event) => setWifiOnly(event.target.checked)} /> Wi-Fi incluso</label><label><input type="checkbox" checked={furnishedOnly} onChange={(event) => setFurnishedOnly(event.target.checked)} /> Mobiliado</label><button type="button" onClick={() => { setType('Todos'); setRooms('Qualquer'); setBudget(''); setWifiOnly(false); setFurnishedOnly(false); setLocation(''); setQuery(''); }}>Limpar filtros</button></div>}
          </form>

          <div className="results-layout">
            <section className="listing-section">
              <div className="section-heading"><h2><Icon name="home" size={26} />{showFavorites ? 'Meus Favoritos' : 'Imóveis em destaque'}</h2><span className="result-count">{filteredProperties.length} {filteredProperties.length === 1 ? 'opção' : 'opções'}</span><button className="see-all" onClick={() => { setShowFavorites(false); setLocation(''); setQuery(''); setType('Todos'); setBudget(''); }}>Ver todos <Icon name="arrow" size={19} /></button></div>
              {filteredProperties.length ? <div className="listing-grid">{filteredProperties.map((property) => <PropertyCard key={property.id} property={property} favorite={favorites.includes(property.id)} onFavorite={toggleFavorite} />)}</div> : <div className="empty-results"><span>⌕</span><h3>Nenhum imóvel encontrado</h3><p>Tente ampliar a localização ou ajustar os filtros para ver mais opções.</p><button onClick={() => { setLocation(''); setQuery(''); setType('Todos'); setRooms('Qualquer'); setBudget(''); setWifiOnly(false); setFurnishedOnly(false); setShowFavorites(false); }}>Limpar busca</button></div>}
            </section>
            <aside className="results-aside">
              <MapPanel onViewMap={() => setViewMap((value) => !value)} />
              <div className="active-search-card"><div className="aside-icon purple"><Icon name="search" size={20} /></div><div><strong>{viewMap ? 'Mapa demonstrativo' : 'Sua busca está ativa'}</strong><p>{viewMap ? 'O mapa é ilustrativo e não representa a localização exata dos anúncios.' : 'Mostrando imóveis que combinam com seus filtros.'}</p></div><button onClick={() => setExpandedFilters(true)}>Editar filtros</button></div>
              <div className="safety-card"><span className="aside-icon pink"><Icon name="shield" size={21} /></span><div><strong>Fique seguro!</strong><p>Converse diretamente com anunciantes e procure perfis verificados na plataforma.</p></div></div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
