import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountMenu } from '../components/AccountMenu.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import { Logo } from '../components/Logo.jsx';
import { getDemoUser } from '../utils/demoUser.js';
import { getDemoListing, getDemoListingStatuses, setDemoListingStatus } from '../utils/demoListings.js';
import {
  getAccessToken,
  downloadContractDocument,
  getContractDocuments,
  getRentalContracts,
  getPaymentTransactionStatus,
  getPaymentTransactions,
  getReceivedInterests,
  listCompatibleStudents,
  uploadContractDocument,
  updateInterestStatus,
} from '../services/api.js';
import { filterPaymentTransactions, summarizePaymentTransactions } from '../services/paymentHistory.js';
import './OwnerDashboardPage.css';

const properties = [];

/* Exemplo visual ocultado; mantido para referência.
const offererListings = [
  { id: 'vaga-village', title: 'Apartamento compartilhado – Village', neighborhood: 'Village Campestre', type: 'Apartamento', room: 'Quarto individual', residents: 2, rent: 500, interested: 3, status: 'Ativa', image: 'apartment' },
  { id: 'vaga-farol', title: 'Casa compartilhada no Farol', neighborhood: 'Farol', type: 'Casa', room: 'Quarto individual', residents: 2, rent: 700, interested: 5, status: 'Encerrada', image: 'house' },
];
*/
const offererListings = [];

/* Exemplo visual ocultado; mantido para referência.
const applicants = [
  { id: 'ana-beatriz', name: 'Ana Clara', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Ciência da Computação', period: '2º período', gender: 'Feminino', status: 'Em conversa', property: 'apt-ufal', initials: 'AC' },
  { id: 'carolina-lima', name: 'Beatriz Lima', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Administração', period: '1º período', gender: 'Feminino', status: 'Aguardando resposta', property: 'apt-ufal', initials: 'BL' },
  { id: 'ana-beatriz', name: 'Lucas Ferreira', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Engenharia da Computação', period: '3º período', gender: 'Masculino', status: 'Recusado', property: 'apt-ufal', initials: 'LF' },
  { id: 'carolina-lima', name: 'Marina Santos', university: 'Centro Universitário CESMAC', course: 'Psicologia', period: '4º período', gender: 'Feminino', status: 'Aguardando resposta', property: 'casa-farol', initials: 'MS' },
  { id: 'ana-beatriz', name: 'Rafael Costa', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Arquitetura e Urbanismo', period: '5º período', gender: 'Masculino', status: 'Em conversa', property: 'casa-farol', initials: 'RC' },
];
*/
const applicants = [];

/* Exemplo visual ocultado; mantido para referência.
const offererApplicants = [
  { id: 'ana-beatriz', name: 'Ana Clara', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Ciência da Computação', period: '2º período', gender: 'Feminino', status: 'Em conversa', property: 'vaga-village', initials: 'AC', age: 20, habits: ['Organizada', 'Tranquila', 'Não fuma'] },
  { id: 'carolina-lima', name: 'Lucas Ferreira', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Engenharia da Computação', period: '3º período', gender: 'Masculino', status: 'Aguardando resposta', property: 'vaga-village', initials: 'LF', age: 21, habits: ['Responsável', 'Comunicativo', 'Não tem pets'] },
  { id: 'ana-beatriz', name: 'Beatriz Lima', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Administração', period: '1º período', gender: 'Feminino', status: 'Recusado', property: 'vaga-village', initials: 'BL', age: 22, habits: ['Estudiosa', 'Organizada', 'Tem pets'] },
];
*/
const offererApplicants = [];

const ownerSections = [
  { path: '/proprietario', label: 'Início', icon: 'home', end: true },
  { path: '/anunciar', label: 'Anunciar imóvel', icon: 'homeGroup' },
  { path: '/mensagens', label: 'Minhas Mensagens', icon: 'message' },
  { path: '/proprietario/imoveis', label: 'Meus Imóveis', icon: 'homeGroup' },
  { path: '/proprietario/interessados', label: 'Interessados', icon: 'users' },
  { path: '/proprietario/contratos', label: 'Contratos', icon: 'paperclip' },
  { path: '/proprietario/pagamentos', label: 'Pagamentos', icon: 'money' },
  { path: '/perfil', label: 'Meu Perfil', icon: 'person' },
];

const offererSections = [
  { path: '/ofertante', label: 'Início', icon: 'home', end: true },
  { path: '/buscar', label: 'Buscar vagas', icon: 'search' },
  { path: '/anunciar', label: 'Anunciar imóvel', icon: 'homeGroup' },
  { path: '/mensagens', label: 'Minhas Mensagens', icon: 'message' },
  { path: '/buscar?favoritos=1', label: 'Meus Favoritos', icon: 'heart' },
  { path: '/ofertante/vagas', label: 'Minhas vagas', icon: 'homeGroup' },
  { path: '/ofertante/interessados', label: 'Interessados', icon: 'users' },
  { path: '/ofertante/contratos', label: 'Contratos', icon: 'paperclip' },
  { path: '/ofertante/pagamentos', label: 'Pagamentos', icon: 'money' },
  { path: '/perfil', label: 'Meu Perfil', icon: 'person' },
];

export function OwnerSidebar({ pathname, role }) {
  const isOfferer = role === 'ofertante';
  const navItems = isOfferer ? offererSections : ownerSections;
  const location = useLocation();
  const currentPathname = pathname ?? location.pathname;
  const searchParams = new URLSearchParams(location.search);
  return <aside className="dashboard-sidebar owner-sidebar">
    <Link className="dashboard-brand" to="/" aria-label="Moraê, voltar à landing page"><Logo /></Link>
    <nav className="dashboard-nav" aria-label={`Menu do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`}>
      {navItems.map((item) => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => {
        const selected = item.path === '/buscar?favoritos=1'
          ? currentPathname === '/buscar' && searchParams.get('favoritos') === '1'
          : item.path === '/buscar'
            ? currentPathname === '/buscar' && searchParams.get('favoritos') !== '1'
            : isActive;
        return `${selected ? 'selected' : ''}${item.path === '/anunciar' ? ' owner-announce-link' : ''}`;
      }}><LineIcon name={item.icon} />{item.label}</NavLink>)}
    </nav>
    <span className="sidebar-version">Moraê · Maceió, AL</span>
  </aside>;
}

export function OwnerTopbar({ query, setQuery, role }) {
  const [notice, setNotice] = useState(false);
  const isOfferer = role === 'ofertante';
  const displayName = getDemoUser()?.name || (isOfferer ? 'Aluno' : 'Proprietário');
  const avatarInitial = displayName.charAt(0).toLocaleUpperCase('pt-BR');
  return <header className="dashboard-topbar owner-topbar">
    <label className="owner-search"><LineIcon name="search" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isOfferer ? 'Buscar por pessoa, vaga ou contrato...' : 'Buscar por imóvel, interessado ou contrato...'} aria-label={`Buscar no painel do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`} /></label>
    <div className="topbar-actions"><button className="icon-button" type="button" aria-label="Notificações" onClick={() => setNotice((open) => !open)}><LineIcon name="bell" size={21} />{!notice && <i />}</button><span className="topbar-divider" /><AccountMenu className="profile-menu"><span className="profile-avatar">{avatarInitial}</span><span>Olá, {displayName}</span><span className="chevron" /></AccountMenu></div>
    {notice && <div className="owner-notice"><strong>Olá, {displayName}!</strong><span>Você tem interessados aguardando resposta.</span></div>}
  </header>;
}

export function PropertyPhoto({ type }) {
  return <div className={`owner-property-photo owner-photo-${type}`} aria-label="Imagem ilustrativa do imóvel"><span className="owner-photo-window" /><span className="owner-photo-sofa" /><span className="owner-photo-table" /><span className="owner-photo-plant" /></div>;
}

function PropertyCard({
  property,
  query = '',
  basePath = '/proprietario',
  listingStatus = 'active',
  onArchive,
  onDelete,
  onRestore,
}) {
  const navigate = useNavigate();
  const savedListing = getDemoListing(property.id);
  const displayedProperty = savedListing ? {
    ...property,
    title: savedListing.listingTitle || property.title,
    neighborhood: savedListing.neighborhood || property.neighborhood,
    type: savedListing.propertyType || property.type,
    room: savedListing.rooms ? `${savedListing.rooms} quartos` : property.room,
    rent: Number(savedListing.rent || property.rent),
  } : property;
  const matchesQuery = !query || `${displayedProperty.title} ${displayedProperty.neighborhood} ${displayedProperty.type}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
  if (!matchesQuery) return null;
  const openProperty = () => navigate(`/imoveis/${displayedProperty.id}`);
  return (
    <article className="owner-property-card" role="link" tabIndex={0}
      aria-label={`Ver detalhes de ${displayedProperty.title}`}
      onClick={(event) => { if (!event.target.closest('a, button')) openProperty(); }}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openProperty(); } }}>
      <PropertyPhoto type={displayedProperty.image} />
      <div className="owner-property-info">
        <div className="owner-property-title-row">
          <h3>{displayedProperty.title}</h3>
          <span className={`owner-status ${listingStatus === 'archived' ? 'archived' : 'published'}`}>
            {listingStatus === 'archived' ? 'Arquivado' : displayedProperty.status}
          </span>
        </div>
        <p className="owner-property-location"><LineIcon name="pin" size={14} />{displayedProperty.neighborhood} · Maceió/AL</p>
        <div className="owner-property-meta">
          <span><LineIcon name="home" size={14} />{displayedProperty.type}</span>
          <span><LineIcon name="homeGroup" size={14} />{displayedProperty.room}</span>
          <span><LineIcon name="users" size={14} />{displayedProperty.residents} moradores</span>
        </div>
        <div className="owner-property-bottom">
          <strong>{displayedProperty.rent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<small>/mês</small></strong>
          <span><LineIcon name="users" size={14} />{displayedProperty.interested} interessados</span>
        </div>
        <div className="owner-property-actions">
          {listingStatus === 'archived' ? (
            <button type="button" onClick={() => onRestore?.(property)}>Reativar</button>
          ) : (
            <>
              <Link to={`/anunciar?editar=${property.id}`}><LineIcon name="edit" size={14} />Editar</Link>
              <button type="button" onClick={() => onArchive?.(property)}>Arquivar</button>
            </>
          )}
          <Link to={`${basePath}/interessados?imovel=${property.id}`}><LineIcon name="users" size={14} />Interessados</Link>
          <button className="danger" type="button" onClick={() => onDelete?.(property)}>Excluir</button>
        </div>
      </div>
    </article>
  );
}

const demoCompatibleProfiles = [];

function initialsOf(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR') || '?';
}

// Sem login (modo demonstração) mostra perfis de exemplo; logado, usa o ranking da API.
function useCompatibleProfiles() {
  const [state, setState] = useState(() => (getAccessToken() ? { status: 'loading', profiles: [], error: '' } : { status: 'demo', profiles: demoCompatibleProfiles, error: '' }));

  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let cancelled = false;
    listCompatibleStudents({ limit: 6 })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          error: '',
          profiles: (data.items ?? []).map((item) => ({
            id: item.userId,
            name: item.name,
            initials: initialsOf(item.name),
            subtitle: `${item.course} · ${item.period}º período`,
            tags: item.sharedTraits ?? [],
            score: item.score,
            level: item.level,
            hasCriticalDifference: item.hasCriticalDifference,
          })),
        });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', profiles: [], error: error.message || 'Não foi possível carregar as sugestões de compatibilidade.' });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}

function OffererHome({ query, displayName, statuses = {} }) {
  const compatible = useCompatibleProfiles();
  const normalizedQuery = query?.toLocaleLowerCase('pt-BR');
  const profiles = compatible.profiles.filter((person) => !normalizedQuery || `${person.name} ${person.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery));
  const listing = offererListings.find((item) => (statuses[item.id] ?? 'active') === 'active');
  const emptyMessage = compatible.status === 'loading'
    ? 'Calculando quem combina com você…'
    : compatible.status === 'error'
      ? compatible.error
      : query ? 'Nenhuma pessoa compatível corresponde à busca.' : 'Ainda não há outros estudantes com o questionário de convivência respondido.';
  return <div className="owner-content offerer-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="person" size={30} /></span><div><h1>Olá, {displayName || 'Ofertador'}!</h1><p>Aqui você pode encontrar pessoas compatíveis, anunciar sua vaga e acompanhar todo o processo.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="offerer-matches"><h2><LineIcon name="users" size={22} />Pessoas que podem ser compatíveis com você</h2><p>Com base nas suas respostas do questionário de convivência</p>{profiles.length ? <div className="offerer-match-grid">{profiles.map((person) => <article className="offerer-match-card" key={`${person.name}-${person.id}`}><span className="owner-applicant-avatar">{person.initials}</span><h3>{person.name}</h3>{person.score !== undefined && <strong className={`offerer-match-score level-${(person.level || 'medium').toLowerCase()}`} title={person.hasCriticalDifference ? 'Há uma diferença importante de hábitos' : undefined}>{person.score}% compatível{person.hasCriticalDifference ? ' · atenção' : ''}</strong>}<p>{person.subtitle}</p>{person.tags.length > 0 && <div>{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}<Link to={`/usuarios/${person.id}`}>Ver perfil <LineIcon name="arrow" size={14} /></Link></article>)}</div> : <p className="owner-empty" role={compatible.status === 'loading' ? 'status' : undefined}>{emptyMessage}</p>}</section>
    <section className="offerer-vacancies-preview"><div className="offerer-subheading"><div><h2><LineIcon name="homeGroup" size={22} />Suas vagas anunciadas</h2><p>Gerencie suas vagas e acompanhe as interações.</p></div><Link to="/ofertante/vagas">Ver todas</Link></div>{listing ? <PropertyCard property={listing} query={query} basePath="/ofertante" /> : <p className="owner-empty">Você não possui vagas ativas. Acesse Minhas vagas para consultar os anúncios arquivados.</p>}</section>
  </div>;
}

function ListingsManager({ query, listings, statuses, basePath, isOfferer, onArchive, onDelete, onRestore }) {
  const [filter, setFilter] = useState('active');
  const activeListings = listings.filter((item) => (statuses[item.id] ?? 'active') === 'active');
  const archivedListings = listings.filter((item) => statuses[item.id] === 'archived');
  const visibleListings = filter === 'active' ? activeListings : archivedListings;
  const filtered = visibleListings.filter((item) => !query || `${item.title} ${item.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  return (
    <div className="owner-content">
      <section className="owner-welcome compact">
        <span className="owner-welcome-icon"><LineIcon name="homeGroup" size={29} /></span>
        <div>
          <h1>{isOfferer ? 'Minhas vagas' : 'Meus imóveis'}</h1>
          <p>Gerencie seus anúncios, pause temporariamente ou remova os que não serão mais utilizados.</p>
        </div>
        <i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" />
      </section>
      <div className="listing-management-toolbar">
        <div className="listing-management-tabs" role="tablist" aria-label="Situação dos anúncios">
          <button type="button" role="tab" aria-selected={filter === 'active'} className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
            Ativos <span>{activeListings.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={filter === 'archived'} className={filter === 'archived' ? 'active' : ''} onClick={() => setFilter('archived')}>
            Arquivados <span>{archivedListings.length}</span>
          </button>
        </div>
        <Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>{isOfferer ? 'Anunciar nova vaga' : 'Anunciar imóvel'}</Link>
      </div>
      <section className="owner-property-list" aria-label={filter === 'active' ? 'Anúncios ativos' : 'Anúncios arquivados'}>
        {filtered.length ? filtered.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            query={query}
            basePath={basePath}
            listingStatus={filter}
            onArchive={onArchive}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        )) : (
          <p className="owner-empty">
            {filter === 'active' ? 'Você não tem anúncios ativos no momento.' : 'Você ainda não possui anúncios arquivados.'}
          </p>
        )}
      </section>
    </div>
  );
}

function OwnerHome({ query, displayName, statuses = {} }) {
  const visibleProperties = properties.filter((property) => (statuses[property.id] ?? 'active') === 'active').filter((property) => !query || `${property.title} ${property.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const stats = [
    { label: 'Imóveis anunciados', value: properties.length, icon: 'home', to: '/proprietario/imoveis' },
    { label: 'Interessados', value: applicants.length, icon: 'users', to: '/proprietario/interessados' },
    { label: 'Contratos ativos', value: 0, icon: 'paperclip', to: '/proprietario/contratos' },
    { label: 'Pagamentos pendentes', value: 0, icon: 'money', to: '/proprietario/pagamentos', pink: true },
  ];
  return <div className="owner-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="homeGroup" size={29} /></span><div><h1>Olá, {displayName || 'Proprietário'}!</h1><p>Acompanhe seus imóveis, interessados e recebimentos em um só lugar.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-stats" aria-label="Resumo da conta">{stats.map((stat) => <Link className={`owner-stat${stat.pink ? ' pink' : ''}`} to={stat.to} key={stat.label}><span><LineIcon name={stat.icon} size={19} /></span><strong>{stat.label}</strong><b>{stat.value}<LineIcon name="arrow" size={16} /></b></Link>)}</section>
    <div className="owner-section-heading"><h2><LineIcon name="home" size={24} />Meus imóveis</h2><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar imóvel</Link></div>
    <section className="owner-property-list" aria-label="Imóveis anunciados">{visibleProperties.length ? visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />) : <p className="owner-empty">Nenhum imóvel corresponde à busca.</p>}</section>
  </div>;
}

function InterestedPage({ query, selectedProperty, setSelectedProperty, role }) {
  const navigate = useNavigate();
  const isOfferer = role === 'ofertante';
  const authenticated = Boolean(getAccessToken());
  const roleProperties = isOfferer ? offererListings : properties;
  const roleApplicants = isOfferer ? offererApplicants : applicants;
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [receivedLoading, setReceivedLoading] = useState(authenticated);
  const [receivedError, setReceivedError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingInterest, setUpdatingInterest] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [applicantStatuses, setApplicantStatuses] = useState(() => {
    const initialStatuses = Object.fromEntries(roleApplicants.map((applicant) => [`${applicant.property}:${applicant.id}:${applicant.name}`, applicant.status]));
    try { return { ...initialStatuses, ...JSON.parse(localStorage.getItem(`morae.applicant-statuses.${role}`) || '{}') }; }
    catch { return initialStatuses; }
  });

  useEffect(() => {
    if (!authenticated) return undefined;
    let cancelled = false;
    getReceivedInterests()
      .then((items) => {
        if (!cancelled) setReceivedInterests(items);
      })
      .catch((error) => {
        if (!cancelled) setReceivedError(error.message || 'Não foi possível consultar os interessados.');
      })
      .finally(() => {
        if (!cancelled) setReceivedLoading(false);
      });
    return () => { cancelled = true; };
  }, [authenticated]);

  const liveListings = [...new Map(receivedInterests.map((item) => [item.listingId, {
    id: item.listingId,
    title: item.listingTitle,
    neighborhood: item.neighborhood,
    type: 'Anúncio publicado',
    room: '',
    residents: 0,
    rent: 0,
    interested: 0,
    status: 'Publicado',
    image: 'apartment',
  }])).values()];
  const availableProperties = authenticated ? liveListings : roleProperties;
  const property = availableProperties.find(({ id }) => id === selectedProperty) ?? availableProperties[0];
  const liveApplicants = authenticated ? receivedInterests
    .filter((item) => item.listingId === property?.id)
    .map((item) => ({
      id: item.userId,
      name: item.name,
      university: item.city,
      course: item.course || 'Curso não informado',
      period: item.period ? `${item.period}º período` : 'Período não informado',
      gender: '',
      status: ({
        PENDING: 'Aguardando resposta',
        IN_CONVERSATION: 'Em conversa',
        ACCEPTED: 'Aceito',
        REJECTED: 'Recusado',
        WITHDRAWN: 'Retirado',
      })[item.status],
      property: item.listingId,
      initials: item.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR'),
      email: item.email,
      phone: item.phone,
      interestedAt: item.interestedAt,
    })) : [];
  const propertyApplicants = authenticated ? liveApplicants : roleApplicants.filter((applicant) => applicant.property === property?.id);
  const statusFor = (applicant) => authenticated
    ? applicant.status
    : applicantStatuses[`${applicant.property}:${applicant.id}:${applicant.name}`] ?? applicant.status;
  const filteredApplicants = propertyApplicants.filter((applicant) => (filter === 'Todos' || statusFor(applicant) === filter) && (!query || `${applicant.name} ${applicant.course} ${applicant.university}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  const filters = ['Todos', 'Em conversa', 'Aguardando resposta', 'Aceito', 'Recusado', 'Retirado'];
  useEffect(() => {
    if (authenticated) return;
    try { localStorage.setItem(`morae.applicant-statuses.${role}`, JSON.stringify(applicantStatuses)); }
    catch { /* A ação continua disponível durante a sessão, mesmo sem armazenamento local. */ }
  }, [applicantStatuses, role, authenticated]);
  function rejectApplicant(applicant) {
    setApplicantStatuses((current) => ({ ...current, [`${applicant.property}:${applicant.id}:${applicant.name}`]: 'Recusado' }));
  }
  async function changeInterestStatus(applicant, nextStatus) {
    setStatusError('');
    setUpdatingInterest(`${applicant.property}:${applicant.id}`);
    try {
      await updateInterestStatus(applicant.property, applicant.id, nextStatus);
      setReceivedInterests((current) => current.map((interest) => (
        interest.listingId === applicant.property && interest.userId === applicant.id
          ? { ...interest, status: nextStatus }
          : interest
      )));
      if (nextStatus === 'ACCEPTED') {
        const params = new URLSearchParams({ listingId: applicant.property, interesse: 'aceito' });
        if (applicant.email) params.set('tenantEmail', applicant.email);
        navigate({ pathname: '/pagamento-aluguel', search: `?${params.toString()}`, hash: '#enviar-convite' });
      }
    } catch (error) {
      setStatusError(error.message || 'Não foi possível atualizar a manifestação.');
    } finally {
      setUpdatingInterest('');
    }
  }

  if (authenticated && receivedLoading) return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>Interessados no seu anúncio</h1><p>Consultando manifestações recebidas…</p></div></section></div>;
  if (authenticated && receivedError) return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>Interessados no seu anúncio</h1><p role="alert">{receivedError}</p></div></section></div>;
  if (authenticated && !receivedInterests.length) return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>Interessados no seu anúncio</h1><p>As manifestações recebidas aparecerão aqui.</p></div></section><p className="owner-empty">Você ainda não recebeu manifestações de interesse.</p></div>;
  if (!property) return <div className="owner-content"><p className="owner-empty">Nenhum anúncio disponível.</p></div>;

  return <div className="owner-content">
    <section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>{isOfferer ? 'Interessados na sua vaga' : 'Interessados no seu imóvel'}</h1><p>Pessoas que demonstraram interesse no seu anúncio e estão em contato com você.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-selected-property"><PropertyPhoto type={property.image} /><div><h2>{property.title}</h2><p><LineIcon name="pin" size={14} />{property.neighborhood} · Maceió/AL</p>{!authenticated && <div><span><LineIcon name="home" size={13} />{property.type}</span><span><LineIcon name="homeGroup" size={13} />{property.room}</span><span><LineIcon name="users" size={13} />{property.residents} moradores</span></div>}</div><span className="owner-status published">Ativo</span><Link to={`/imoveis/${property.id}`}>Ver anúncio <LineIcon name="arrow" size={15} /></Link></section>
    <label className="owner-property-select">{isOfferer ? 'Vaga selecionada' : 'Imóvel selecionado'}<select value={property.id} onChange={(event) => setSelectedProperty(event.target.value)}>{availableProperties.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}</select></label>
    {statusError && <p role="alert" className="owner-empty">{statusError}</p>}
    <div className="owner-applicant-toolbar"><div className="owner-applicant-filters" role="group" aria-label="Filtrar interessados">{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}<small>{item === 'Todos' ? propertyApplicants.length : propertyApplicants.filter((applicant) => statusFor(applicant) === item).length}</small></button>)}</div><label className="owner-sort">Ordenar por<select defaultValue="recent"><option value="recent">Mais recentes</option><option value="name">Nome</option></select></label></div>
    <section className="owner-applicant-list" aria-label="Lista de interessados">{filteredApplicants.length ? filteredApplicants.map((applicant) => { const status = statusFor(applicant); const contactId = authenticated ? applicant.id : `estudante-${applicant.name.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-')}`; const chatParams = new URLSearchParams({ contato: contactId, nome: applicant.name, papel: 'Estudante', imovel: property.title, ...(authenticated ? { anuncio: property.id } : {}) }); const liveKey = `${applicant.property}:${applicant.id}`; const busy = updatingInterest === liveKey; return <article className="owner-applicant-card" key={`${applicant.property}:${applicant.id}:${applicant.name}`}><span className="owner-applicant-avatar">{applicant.initials}</span><div className="owner-applicant-info"><h3>{applicant.name}</h3><p>{applicant.university}</p><p>{applicant.course} <i /> {applicant.period} <i /> {applicant.gender}</p>{authenticated && <small>Manifestou interesse em {new Date(applicant.interestedAt).toLocaleDateString('pt-BR')}</small>}</div><span className={`owner-applicant-status ${['Em conversa', 'Aceito'].includes(status) ? 'chatting' : ['Recusado', 'Retirado'].includes(status) ? 'declined' : 'waiting'}`}>{status}</span><span className="owner-applicant-chevron" aria-hidden="true">›</span><div className="owner-applicant-actions"><Link to={`/mensagens?${chatParams.toString()}`}><LineIcon name="message" size={14} />Ver chat</Link><Link to={`/usuarios/${applicant.id}`}><LineIcon name="person" size={14} />Ver perfil</Link>{authenticated ? <>{status === 'Aguardando resposta' && <button type="button" disabled={busy} onClick={() => changeInterestStatus(applicant, 'IN_CONVERSATION')}>Iniciar conversa</button>}{['Aguardando resposta', 'Em conversa'].includes(status) && <><button type="button" disabled={busy} onClick={() => changeInterestStatus(applicant, 'ACCEPTED')}>Aceitar</button><button type="button" disabled={busy} onClick={() => changeInterestStatus(applicant, 'REJECTED')}>Recusar</button></>}</> : status !== 'Recusado' && <button type="button" onClick={() => rejectApplicant(applicant)} aria-label={`Recusar ${applicant.name}`}>Recusar</button>}</div></article>; }) : <p className="owner-empty">Nenhum interessado neste filtro.</p>}</section>
  </div>;
}

const paymentStatusLabels = {
  paid: 'Pago',
  pending: 'Pendente',
  rejected: 'Recusado',
  overdue: 'Em atraso',
  cancelled: 'Cancelado',
  refunded: 'Estornado',
};

function PaymentHistoryPage({ role, query }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getPaymentTransactions({ from: startDate, to: endDate, status })
      .then((result) => {
        if (!cancelled) setTransactions(result);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setTransactions([]);
          setError(requestError.message || 'Não foi possível consultar os pagamentos.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [startDate, endDate, status]);

  useEffect(() => {
    if (!selectedReceipt) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedReceipt(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedReceipt]);

  const visibleTransactions = filterPaymentTransactions(transactions, {
    startDate,
    endDate,
    status,
    query,
  });
  const totals = summarizePaymentTransactions(visibleTransactions);
  const formatCurrency = (amountInCents) => (amountInCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
  const formatDateTime = (value) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Maceio' });

  async function openReceipt(transaction) {
    setSelectedReceipt(transaction);
    setReceiptData(null);
    setReceiptError('');
    setReceiptLoading(true);
    try {
      const details = await getPaymentTransactionStatus(transaction.id);
      if (details.status !== 'PAID') {
        throw new Error('O comprovante fica disponível após a confirmação do pagamento.');
      }
      setReceiptData({ ...transaction, ...details });
    } catch (requestError) {
      setReceiptError(requestError.message || 'Não foi possível consultar o comprovante.');
    } finally {
      setReceiptLoading(false);
    }
  }

  function closeReceipt() {
    setSelectedReceipt(null);
    setReceiptData(null);
    setReceiptError('');
  }

  function clearFilters() {
    setStartDate('');
    setEndDate('');
    setStatus('all');
  }

  return <div className="owner-content payment-history">
    <section className="owner-welcome compact">
      <span className="owner-welcome-icon"><LineIcon name="money" size={28} /></span>
      <div>
        <h1>Histórico financeiro</h1>
        <p>Consulte pagamentos e recebimentos vinculados à sua conta.</p>
      </div>
      <i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" />
    </section>
    <section className="payment-summary" aria-label="Resumo do histórico filtrado">
      <article><span>Total recebido</span><strong>{formatCurrency(totals.received)}</strong></article>
      <article><span>Total pago</span><strong>{formatCurrency(totals.paid)}</strong></article>
      <article><span>Em aberto</span><strong>{formatCurrency(totals.open)}</strong></article>
      <article><span>Taxas da plataforma</span><strong>{formatCurrency(totals.platformFees)}</strong></article>
    </section>
    <div className="payment-rent-cta">
      <div><strong>Precisa pagar o aluguel?</strong><span>Confira seu contrato e continue para o checkout seguro.</span></div>
      <Link className="owner-primary-button" to="/pagamento-aluguel">Pagar aluguel</Link>
    </div>
    <section className="payment-history-panel">
      <div className="payment-history-heading">
        <div><h2>Transações</h2><span>{visibleTransactions.length} {visibleTransactions.length === 1 ? 'lançamento' : 'lançamentos'}</span></div>
        <button type="button" onClick={clearFilters}>Limpar filtros</button>
      </div>
      <div className="payment-filters">
        <label>De<input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label>Até<input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} /></label>
        <label>Situação<select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todas</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="rejected">Recusado</option>
          <option value="overdue">Em atraso</option>
          <option value="cancelled">Cancelado</option>
          <option value="refunded">Estornado</option>
        </select></label>
      </div>
      {loading ? <div className="payment-empty-state" role="status">Consultando seu histórico financeiro…</div>
        : error ? <div className="payment-empty-state" role="alert">{error}</div>
          : visibleTransactions.length ? <div className="payment-table-wrap">
        <table className="payment-table" aria-label="Transações do histórico financeiro">
          <thead><tr><th>Transação</th><th>Outra parte</th><th>Data</th><th>Forma</th><th>Aluguel</th><th>Taxa da plataforma</th><th>Total cobrado</th><th>Situação</th><th>Comprovante</th></tr></thead>
          <tbody>{visibleTransactions.map((transaction) => <tr key={transaction.id}>
            <td data-label="Transação">{transaction.title}</td>
            <td data-label="Outra parte">{transaction.counterparty}</td>
            <td data-label="Data">{formatDate(transaction.date)}</td>
            <td data-label="Forma">{transaction.method}</td>
            <td data-label="Aluguel">{transaction.rentAmountInCents === null ? '—' : formatCurrency(transaction.rentAmountInCents)}</td>
            <td data-label="Taxa da plataforma">{transaction.platformFeeInCents === null ? '—' : formatCurrency(transaction.platformFeeInCents)}</td>
            <td data-label="Total cobrado" className="payment-amount">{formatCurrency(transaction.amountInCents)}</td>
            <td data-label="Situação"><span className={`payment-status ${transaction.status}`}>{paymentStatusLabels[transaction.status]}</span></td>
            <td data-label="Comprovante">{transaction.status === 'paid' ? <button className="payment-receipt-link" type="button" disabled={receiptLoading} onClick={() => openReceipt(transaction)}>{receiptLoading && selectedReceipt?.id === transaction.id ? 'Carregando…' : 'Ver comprovante'}</button> : '—'}</td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="payment-empty-state">
        <LineIcon name="emptyReview" size={30} />
        <strong>Nenhuma transação encontrada</strong>
        <span>Esta conta ainda não possui transações para os filtros selecionados.</span>
      </div>}
    </section>
    {selectedReceipt && <div className="payment-receipt-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeReceipt(); }}>
      <section className="payment-receipt" role="dialog" aria-modal="true" aria-labelledby="payment-receipt-title">
        <div className="payment-receipt-toolbar">
          <span>moraê.</span>
          <button type="button" onClick={closeReceipt} aria-label="Fechar comprovante">Fechar</button>
        </div>
        {receiptLoading ? <div className="payment-receipt-message" role="status">Consultando confirmação do pagamento…</div>
          : receiptError ? <div className="payment-receipt-message" role="alert">{receiptError}</div>
            : receiptData && <>
              <header className="payment-receipt-header">
                <span>COMPROVANTE DE PAGAMENTO</span>
                <h2 id="payment-receipt-title">{receiptData.title}</h2>
                <strong>Pagamento aprovado</strong>
              </header>
              <dl className="payment-receipt-details">
                <div><dt>Outra parte</dt><dd>{receiptData.counterparty}</dd></div>
                <div><dt>Forma de pagamento</dt><dd>{receiptData.method}</dd></div>
                <div><dt>{receiptData.paidAt ? 'Data do pagamento' : 'Data da transação'}</dt><dd>{receiptData.paidAt ? formatDateTime(receiptData.paidAt) : formatDate(receiptData.date)}</dd></div>
                <div><dt>Identificação Moraê</dt><dd>{receiptData.id}</dd></div>
              </dl>
              <div className="payment-receipt-breakdown">
                {receiptData.rentAmountInCents !== null && <div><span>Aluguel</span><strong>{formatCurrency(receiptData.rentAmountInCents)}</strong></div>}
                {receiptData.platformFeeInCents !== null && <div><span>Taxa da plataforma</span><strong>{formatCurrency(receiptData.platformFeeInCents)}</strong></div>}
                <div className="payment-receipt-total"><span>Total cobrado</span><strong>{formatCurrency(receiptData.amountInCents)}</strong></div>
              </div>
              <p className="payment-receipt-note">Registro de pagamento confirmado pela Moraê. Use “Imprimir / salvar PDF” para guardar uma cópia. Este documento não substitui comprovantes ou documentos fiscais emitidos pelo Mercado Pago.</p>
              <div className="payment-receipt-actions">
                <button type="button" onClick={closeReceipt}>Voltar ao histórico</button>
                <button type="button" onClick={() => window.print()}>Imprimir / salvar PDF</button>
              </div>
            </>}
      </section>
    </div>}
  </div>;
}


const residentialLeaseClauses = [];

const contractDocumentTypeOptions = [
  ['SIGNED_CONTRACT', 'Contrato assinado'],
  ['IDENTITY_DOCUMENT', 'Documento de identificação'],
  ['PROOF_OF_ADDRESS', 'Comprovante de endereço'],
  ['OTHER', 'Outro documento'],
];

const rentalContractStatusLabels = {
  PENDING: 'Aguardando aceite',
  ACTIVE: 'Ativo',
  REJECTED: 'Recusado',
  TERMINATED: 'Encerrado',
};

function formatContractCurrency(cents) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatContractDate(date) {
  if (!date) return 'Sem data final informada';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  );
}

function formatDocumentSize(sizeBytes) {
  return sizeBytes < 1024 * 1024
    ? `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
    : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ContractDocumentsPanel() {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState('OTHER');
  const [selectedFile, setSelectedFile] = useState(null);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    getRentalContracts()
      .then((items) => {
        if (!active) return;
        setContracts(items);
        setSelectedContractId((current) =>
          items.some((contract) => contract.id === current)
            ? current
            : items[0]?.id ?? '',
        );
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setContractsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedContractId) {
      setDocuments([]);
      return undefined;
    }
    let active = true;
    setDocumentsLoading(true);
    setError('');
    getContractDocuments(selectedContractId)
      .then((items) => {
        if (active) setDocuments(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setDocumentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedContractId]);

  const selectedContract = contracts.find(
    (contract) => contract.id === selectedContractId,
  );
  const canUpload = selectedContract && selectedContract.status !== 'REJECTED';

  async function handleUpload(event) {
    event.preventDefault();
    if (!selectedContract || !selectedFile) return;
    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setNotice('');
    try {
      const document = await uploadContractDocument(
        selectedContract.id,
        selectedFile,
        documentType,
      );
      setDocuments((current) => [document, ...current]);
      setSelectedFile(null);
      form.reset();
      setNotice('Documento enviado e armazenado com segurança.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setError('');
    try {
      const blob = await downloadContractDocument(
        document.contractId,
        document.id,
      );
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingId('');
    }
  }

  return <section className="contract-documents" aria-labelledby="contract-documents-title">
    <div className="contract-documents-heading">
      <div>
        <h2 id="contract-documents-title">Condições e documentos do contrato</h2>
        <p>Consulte os dados registrados e os arquivos privados compartilhados pelas partes.</p>
      </div>
      {contracts.length > 0 && <label>
        <span>Contrato</span>
        <select
          value={selectedContractId}
          onChange={(event) => {
            setSelectedContractId(event.target.value);
            setDocuments([]);
            setSelectedFile(null);
            setNotice('');
          }}
        >
          {contracts.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.listingTitle} · {rentalContractStatusLabels[contract.status]}
            </option>
          ))}
        </select>
      </label>}
    </div>
    {error && <p className="contract-documents-message error" role="alert">{error}</p>}
    {notice && <p className="contract-documents-message success" role="status">{notice}</p>}
    {contractsLoading ? <p className="contract-documents-empty" role="status">Carregando contratos...</p>
      : contracts.length === 0 ? <p className="contract-documents-empty">Você ainda não possui contratos para enviar ou consultar documentos.</p>
        : <>
          {selectedContract && <section className="contract-conditions" aria-labelledby="contract-conditions-title">
            <h3 id="contract-conditions-title">Condições da contratação</h3>
            <div className="contract-condition-grid">
              <article><small>Valor mensal</small><strong>{formatContractCurrency(selectedContract.monthlyRentInCents)}</strong></article>
              <article><small>Vencimento</small><strong>Todo dia {selectedContract.dueDay}</strong></article>
              <article><small>Vigência</small><strong>{formatContractDate(selectedContract.startsAt)} a {formatContractDate(selectedContract.endsAt)}</strong></article>
              <article><small>Situação</small><strong>{rentalContractStatusLabels[selectedContract.status]}</strong></article>
              <article><small>Imóvel</small><strong>{selectedContract.listingTitle}</strong><span>{selectedContract.neighborhood} · {selectedContract.city}</span></article>
              <article><small>Proprietário(a)</small><strong>{selectedContract.ownerName}</strong></article>
              <article><small>Estudante</small><strong>{selectedContract.tenantName}</strong></article>
            </div>
            <p>Estas são as condições cadastradas na plataforma. Consulte o documento assinado para confirmar outras cláusulas, encargos e obrigações; o aceite no aplicativo não substitui a formalização legal.</p>
          </section>}
          {canUpload && <form className="contract-document-upload" onSubmit={handleUpload}>
            <label>
              <span>Tipo do documento</span>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                {contractDocumentTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="contract-document-file">
              <span>Arquivo (PDF, PNG ou JPEG; até 10 MB)</span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? 'Enviando...' : 'Enviar documento'}
            </button>
          </form>}
          {!canUpload && <p className="contract-documents-empty">Não é possível adicionar arquivos a um contrato recusado.</p>}
          <div className="contract-document-list" aria-live="polite">
            {documentsLoading ? <p className="contract-documents-empty">Carregando documentos...</p>
              : documents.length === 0 ? <p className="contract-documents-empty">Nenhum documento enviado para este contrato.</p>
                : documents.map((document) => (
                  <article className="contract-document-item" key={document.id}>
                    <span className="contract-document-icon" aria-hidden="true"><LineIcon name="paperclip" size={18} /></span>
                    <div>
                      <strong>{document.originalName}</strong>
                      <small>
                        {contractDocumentTypeOptions.find(([value]) => value === document.documentType)?.[1]}
                        {' · '}{formatDocumentSize(document.sizeBytes)}
                        {' · '}{new Intl.DateTimeFormat('pt-BR').format(new Date(document.createdAt))}
                        {' · enviado por '}{document.uploadedByName}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(document)}
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? 'Baixando...' : 'Baixar'}
                    </button>
                  </article>
                ))}
          </div>
        </>}
  </section>;
}


export function OwnerDashboardPage({ role = 'proprietario' }) {
  const isOfferer = role === 'ofertante';
  const basePath = isOfferer ? '/ofertante' : '/proprietario';
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState(() => getDemoListingStatuses());
  const [listingConfirmation, setListingConfirmation] = useState(null);
  const displayName = getDemoUser()?.name;
  const selectedProperty = searchParams.get('imovel') ?? (isOfferer ? offererListings[0]?.id : properties[0]?.id) ?? '';
  const setSelectedProperty = (id) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('imovel', id); return next; });
  const section = pathname.split('/')[2] ?? '';
  const roleListings = isOfferer ? offererListings : properties;

  function changeListingStatus(property, status) {
    if (status === 'active') {
      setDemoListingStatus(property.id, status);
      setStatuses((current) => ({ ...current, [property.id]: status }));
      return;
    }
    setListingConfirmation({ property, status });
  }

  function confirmListingStatus() {
    if (!listingConfirmation) return;
    const { property, status } = listingConfirmation;
    setDemoListingStatus(property.id, status);
    setStatuses((current) => ({ ...current, [property.id]: status }));
    setListingConfirmation(null);
  }

  useEffect(() => {
    if (!listingConfirmation) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setListingConfirmation(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [listingConfirmation]);

  const archiveListing = (property) => changeListingStatus(property, 'archived');
  const restoreListing = (property) => changeListingStatus(property, 'active');
  const deleteListing = (property) => changeListingStatus(property, 'deleted');

  let content;
  if (section === 'interessados') content = <InterestedPage query={query} selectedProperty={selectedProperty} setSelectedProperty={setSelectedProperty} role={role} />;
  else if (section === 'contratos') content = <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="paperclip" size={28} /></span><div><h1>Contratos e documentos</h1><p>Consulte contratos e documentos reais da sua conta.</p></div></section><div className="owner-section-heading"><h2><LineIcon name="paperclip" size={22} />Enviar convite de contrato</h2><Link className="owner-primary-button" to="/pagamento-aluguel#enviar-convite">Criar convite</Link></div><ContractDocumentsPanel /></div>;
  else if (section === 'pagamentos') content = <PaymentHistoryPage query={query} />;
  else if ((isOfferer && section === 'vagas') || (!isOfferer && section === 'imoveis')) {
    content = <ListingsManager query={query} listings={roleListings} statuses={statuses} basePath={basePath} isOfferer={isOfferer} onArchive={archiveListing} onDelete={deleteListing} onRestore={restoreListing} />;
  } else if (isOfferer) content = <OffererHome query={query} displayName={displayName} statuses={statuses} />;
  else content = <OwnerHome query={query} displayName={displayName} statuses={statuses} />;

  const isDeleting = listingConfirmation?.status === 'deleted';

  return <div className={`owner-dashboard${isOfferer ? ' offerer-dashboard' : ''}`}>
    <OwnerSidebar pathname={pathname} role={role} />
    <main className="owner-main">
      <OwnerTopbar query={query} setQuery={setQuery} role={role} />
      <div className="owner-scroll-content">{content}</div>
    </main>
    {listingConfirmation && (
      <div
        className="listing-confirmation-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setListingConfirmation(null);
        }}
      >
        <section
          className={`listing-confirmation-dialog${isDeleting ? ' is-danger' : ''}`}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="listing-confirmation-title"
          aria-describedby="listing-confirmation-description"
        >
          <span className="listing-confirmation-icon" aria-hidden="true">
  {isDeleting ? (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18v13H3z" />
      <path d="M2 4h20v3H2z" />
      <path d="M9 11h6" />
    </svg>
  )}
</span>
          <h2 id="listing-confirmation-title">
            {isDeleting ? 'Excluir anúncio?' : 'Arquivar anúncio?'}
          </h2>
          <p id="listing-confirmation-description">
            {isDeleting
              ? `Tem certeza de que deseja excluir “${listingConfirmation.property.title}”? Essa ação não poderá ser desfeita.`
              : `O anúncio “${listingConfirmation.property.title}” deixará de aparecer nas buscas. Ele ficará salvo na área de arquivados e poderá ser reativado depois.`}
          </p>
          <div className="listing-confirmation-actions">
            <button type="button" className="listing-confirmation-cancel" onClick={() => setListingConfirmation(null)}>
              Cancelar
            </button>
            <button type="button" className="listing-confirmation-accept" onClick={confirmListingStatus}>
              {isDeleting ? 'Sim, excluir' : 'Sim, arquivar'}
            </button>
          </div>
        </section>
      </div>
    )}
  </div>;
}
