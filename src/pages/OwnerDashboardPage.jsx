import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LineIcon } from '../components/LineIcon.jsx';
import { Logo } from '../components/Logo.jsx';
import { getDemoUser } from '../utils/demoUser.js';
import { getDemoListing } from '../utils/demoListings.js';
import './OwnerDashboardPage.css';

const properties = [
  { id: 'apt-ufal', title: 'Apartamento próximo à UFAL', neighborhood: 'Clima Bom', type: 'Apartamento', room: 'Quarto individual', residents: 2, rent: 600, interested: 3, status: 'Publicado', image: 'apartment' },
  { id: 'casa-farol', title: 'Casa compartilhada no Farol', neighborhood: 'Farol', type: 'Casa', room: 'Quarto individual', residents: 2, rent: 700, interested: 5, status: 'Em análise', image: 'house' },
  { id: 'kitnet-ponta-verde', title: 'Kitnet mobiliada na Ponta Verde', neighborhood: 'Ponta Verde', type: 'Kitnet', room: 'Imóvel inteiro', residents: 1, rent: 950, interested: 2, status: 'Publicado', image: 'kitnet' },
];

const offererListings = [
  { id: 'vaga-village', title: 'Apartamento compartilhado – Village', neighborhood: 'Village Campestre', type: 'Apartamento', room: 'Quarto individual', residents: 2, rent: 500, interested: 3, status: 'Ativa', image: 'apartment' },
  { id: 'vaga-farol', title: 'Casa compartilhada no Farol', neighborhood: 'Farol', type: 'Casa', room: 'Quarto individual', residents: 2, rent: 700, interested: 5, status: 'Encerrada', image: 'house' },
];

const applicants = [
  { id: 'ana-beatriz', name: 'Ana Clara', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Ciência da Computação', period: '2º período', gender: 'Feminino', status: 'Em conversa', property: 'apt-ufal', initials: 'AC' },
  { id: 'carolina-lima', name: 'Beatriz Lima', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Administração', period: '1º período', gender: 'Feminino', status: 'Aguardando resposta', property: 'apt-ufal', initials: 'BL' },
  { id: 'ana-beatriz', name: 'Lucas Ferreira', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Engenharia da Computação', period: '3º período', gender: 'Masculino', status: 'Recusado', property: 'apt-ufal', initials: 'LF' },
  { id: 'carolina-lima', name: 'Marina Santos', university: 'Centro Universitário CESMAC', course: 'Psicologia', period: '4º período', gender: 'Feminino', status: 'Aguardando resposta', property: 'casa-farol', initials: 'MS' },
  { id: 'ana-beatriz', name: 'Rafael Costa', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Arquitetura e Urbanismo', period: '5º período', gender: 'Masculino', status: 'Em conversa', property: 'casa-farol', initials: 'RC' },
];

const offererApplicants = [
  { id: 'ana-beatriz', name: 'Ana Clara', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Ciência da Computação', period: '2º período', gender: 'Feminino', status: 'Em conversa', property: 'vaga-village', initials: 'AC', age: 20, habits: ['Organizada', 'Tranquila', 'Não fuma'] },
  { id: 'carolina-lima', name: 'Lucas Ferreira', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Engenharia da Computação', period: '3º período', gender: 'Masculino', status: 'Aguardando resposta', property: 'vaga-village', initials: 'LF', age: 21, habits: ['Responsável', 'Comunicativo', 'Não tem pets'] },
  { id: 'ana-beatriz', name: 'Beatriz Lima', university: 'Universidade Federal de Alagoas (UFAL)', course: 'Administração', period: '1º período', gender: 'Feminino', status: 'Recusado', property: 'vaga-village', initials: 'BL', age: 22, habits: ['Estudiosa', 'Organizada', 'Tem pets'] },
];

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
  return <aside className="dashboard-sidebar owner-sidebar">
    <Link className="dashboard-brand" to="/" aria-label="Moraê, voltar à landing page"><Logo /></Link>
    <nav className="dashboard-nav" aria-label={`Menu do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`}>
      {navItems.map((item) => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `${isActive ? 'selected' : ''}${item.path === '/anunciar' ? ' owner-announce-link' : ''}`}><LineIcon name={item.icon} />{item.label}</NavLink>)}
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
    <div className="topbar-actions"><button className="icon-button" type="button" aria-label="Notificações" onClick={() => setNotice((open) => !open)}><LineIcon name="bell" size={21} />{!notice && <i />}</button><span className="topbar-divider" /><Link className="profile-menu" to="/perfil"><span className="profile-avatar">{avatarInitial}</span><span>Olá, {displayName}</span><span className="chevron" /></Link></div>
    {notice && <div className="owner-notice"><strong>Olá, {displayName}!</strong><span>Você tem interessados aguardando resposta.</span></div>}
  </header>;
}

export function PropertyPhoto({ type }) {
  return <div className={`owner-property-photo owner-photo-${type}`} aria-label="Imagem ilustrativa do imóvel"><span className="owner-photo-window" /><span className="owner-photo-sofa" /><span className="owner-photo-table" /><span className="owner-photo-plant" /></div>;
}

function PropertyCard({ property, query = '', basePath = '/proprietario' }) {
  const navigate = useNavigate();
  const savedListing = getDemoListing(property.id);
  const displayedProperty = savedListing ? { ...property, title: savedListing.listingTitle || property.title, neighborhood: savedListing.neighborhood || property.neighborhood, type: savedListing.propertyType || property.type, room: savedListing.rooms ? `${savedListing.rooms} quartos` : property.room, rent: Number(savedListing.rent || property.rent) } : property;
  const matchesQuery = !query || `${displayedProperty.title} ${displayedProperty.neighborhood} ${displayedProperty.type}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
  if (!matchesQuery) return null;
  const openProperty = () => navigate(`/imoveis/${displayedProperty.id}`);
  return <article className="owner-property-card" role="link" tabIndex={0} aria-label={`Ver detalhes de ${displayedProperty.title}`} onClick={(event) => { if (!event.target.closest('a, button')) openProperty(); }} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openProperty(); } }}>
    <PropertyPhoto type={displayedProperty.image} />
    <div className="owner-property-info"><div className="owner-property-title-row"><h3>{displayedProperty.title}</h3><span className={`owner-status ${['Publicado', 'Ativa'].includes(displayedProperty.status) ? 'published' : 'reviewing'}`}>{displayedProperty.status}</span></div>
      <p className="owner-property-location"><LineIcon name="pin" size={14} />{displayedProperty.neighborhood} · Maceió/AL</p>
      <div className="owner-property-meta"><span><LineIcon name="home" size={14} />{displayedProperty.type}</span><span><LineIcon name="homeGroup" size={14} />{displayedProperty.room}</span><span><LineIcon name="users" size={14} />{displayedProperty.residents} moradores</span></div>
      <div className="owner-property-bottom"><strong>{displayedProperty.rent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<small>/mês</small></strong><span><LineIcon name="users" size={14} />{displayedProperty.interested} interessados</span></div>
      <div className="owner-property-actions"><Link to={`/anunciar?editar=${property.id}`}><LineIcon name="edit" size={14} />Editar</Link><Link to={`${basePath}/interessados?imovel=${property.id}`}><LineIcon name="users" size={14} />Ver interessados</Link></div>
    </div>
  </article>;
}

function OffererHome({ query, displayName }) {
  const profiles = [
    { name: 'Ana Clara', id: 'ana-beatriz', age: 20, tags: ['Organizada', 'Tranquila', 'Não fuma'], initials: 'AC' },
    { name: 'Lucas Ferreira', id: 'carolina-lima', age: 21, tags: ['Responsável', 'Comunicativo', 'Não tem pets'], initials: 'LF' },
    { name: 'Beatriz Lima', id: 'ana-beatriz', age: 22, tags: ['Estudiosa', 'Organizada', 'Tem pets'], initials: 'BL' },
  ].filter((person) => !query || `${person.name} ${person.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const listing = offererListings[0];
  return <div className="owner-content offerer-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="person" size={30} /></span><div><h1>Olá, {displayName || 'Ofertador'}!</h1><p>Aqui você pode encontrar pessoas compatíveis, anunciar sua vaga e acompanhar todo o processo.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="offerer-matches"><h2><LineIcon name="users" size={22} />Pessoas que podem ser compatíveis com você</h2><p>Com base no seu perfil e preferências</p><div className="offerer-match-grid">{profiles.map((person) => <article className="offerer-match-card" key={`${person.name}-${person.id}`}><span className="owner-applicant-avatar">{person.initials}</span><h3>{person.name}</h3><p>{person.age} anos · Estudante</p><div>{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link to={`/usuarios/${person.id}`}>Ver perfil <LineIcon name="arrow" size={14} /></Link></article>)}</div></section>
    <section className="offerer-vacancies-preview"><div className="offerer-subheading"><div><h2><LineIcon name="homeGroup" size={22} />Suas vagas anunciadas</h2><p>Gerencie suas vagas e acompanhe as interações.</p></div><Link to="/ofertante/vagas">Ver todas</Link></div><PropertyCard property={listing} query={query} basePath="/ofertante" /></section>
  </div>;
}

function OffererVacancies({ query }) {
  const [filter, setFilter] = useState('Todas');
  const filters = ['Todas', 'Ativas', 'Em análise', 'Pausadas', 'Encerradas'];
  const normalizedStatus = (status) => ({ Ativa: 'Ativas', Pausada: 'Pausadas', Encerrada: 'Encerradas' }[status] || status);
  const matchesFilter = (listing) => filter === 'Todas' || normalizedStatus(listing.status) === filter;
  const filtered = offererListings.filter((listing) => matchesFilter(listing) && (!query || `${listing.title} ${listing.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="person" size={29} /></span><div><h1>Minhas Vagas</h1><p>Gerencie as vagas que você está disponibilizando para divisão de aluguel.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section><div className="offerer-vacancy-toolbar"><div>{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}<small>{item === 'Todas' ? offererListings.length : offererListings.filter((listing) => normalizedStatus(listing.status) === item).length}</small></button>)}</div><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar nova vaga</Link></div><label className="owner-sort offerer-sort">Ordenar por<select defaultValue="recent"><option value="recent">Mais recentes</option><option value="rent">Menor valor</option></select></label><section className="owner-property-list">{filtered.length ? filtered.map((property) => <PropertyCard key={property.id} property={property} query={query} basePath="/ofertante" />) : <p className="owner-empty">Nenhuma vaga corresponde a este filtro.</p>}</section></div>;
}

function OwnerHome({ query, displayName }) {
  const visibleProperties = properties.filter((property) => !query || `${property.title} ${property.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const stats = [
    { label: 'Imóveis anunciados', value: properties.length, icon: 'home', to: '/proprietario/imoveis' },
    { label: 'Interessados', value: applicants.length + 3, icon: 'users', to: '/proprietario/interessados' },
    { label: 'Contratos ativos', value: 2, icon: 'paperclip', to: '/proprietario/contratos' },
    { label: 'Pagamentos pendentes', value: 1, icon: 'money', to: '/proprietario/pagamentos', pink: true },
  ];
  return <div className="owner-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="homeGroup" size={29} /></span><div><h1>Olá, {displayName || 'Proprietário'}!</h1><p>Acompanhe seus imóveis, interessados e recebimentos em um só lugar.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-stats" aria-label="Resumo da conta">{stats.map((stat) => <Link className={`owner-stat${stat.pink ? ' pink' : ''}`} to={stat.to} key={stat.label}><span><LineIcon name={stat.icon} size={19} /></span><strong>{stat.label}</strong><b>{stat.value}<LineIcon name="arrow" size={16} /></b></Link>)}</section>
    <div className="owner-section-heading"><h2><LineIcon name="home" size={24} />Meus imóveis</h2><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar imóvel</Link></div>
    <section className="owner-property-list" aria-label="Imóveis anunciados">{visibleProperties.length ? visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />) : <p className="owner-empty">Nenhum imóvel corresponde à busca.</p>}</section>
  </div>;
}

function InterestedPage({ query, selectedProperty, setSelectedProperty, role }) {
  const isOfferer = role === 'ofertante';
  const roleProperties = isOfferer ? offererListings : properties;
  const roleApplicants = isOfferer ? offererApplicants : applicants;
  const [applicantStatuses, setApplicantStatuses] = useState(() => {
    const initialStatuses = Object.fromEntries(roleApplicants.map((applicant) => [`${applicant.property}:${applicant.id}:${applicant.name}`, applicant.status]));
    try { return { ...initialStatuses, ...JSON.parse(localStorage.getItem(`morae.applicant-statuses.${role}`) || '{}') }; }
    catch { return initialStatuses; }
  });
  const [filter, setFilter] = useState('Todos');
  const property = roleProperties.find(({ id }) => id === selectedProperty) ?? roleProperties[0];
  const statusFor = (applicant) => applicantStatuses[`${applicant.property}:${applicant.id}:${applicant.name}`] ?? applicant.status;
  const propertyApplicants = roleApplicants.filter((applicant) => applicant.property === property.id);
  const filteredApplicants = propertyApplicants.filter((applicant) => (filter === 'Todos' || statusFor(applicant) === filter) && (!query || `${applicant.name} ${applicant.course} ${applicant.university}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  const filters = ['Todos', 'Em conversa', 'Aguardando resposta', 'Recusado'];
  useEffect(() => {
    try { localStorage.setItem(`morae.applicant-statuses.${role}`, JSON.stringify(applicantStatuses)); }
    catch { /* A ação continua disponível durante a sessão, mesmo sem armazenamento local. */ }
  }, [applicantStatuses, role]);
  function rejectApplicant(applicant) {
    setApplicantStatuses((current) => ({ ...current, [`${applicant.property}:${applicant.id}:${applicant.name}`]: 'Recusado' }));
  }
  return <div className="owner-content">
    <section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>{isOfferer ? 'Interessados na sua vaga' : 'Interessados no seu imóvel'}</h1><p>Pessoas que demonstraram interesse no seu anúncio e estão em contato com você.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-selected-property"><PropertyPhoto type={property.image} /><div><h2>{property.title}</h2><p><LineIcon name="pin" size={14} />{property.neighborhood} · Maceió/AL</p><div><span><LineIcon name="home" size={13} />{property.type}</span><span><LineIcon name="homeGroup" size={13} />{property.room}</span><span><LineIcon name="users" size={13} />{property.residents} moradores</span></div></div><span className="owner-status published">Ativo</span><Link to={`/imoveis/${property.id}`}>Ver anúncio <LineIcon name="arrow" size={15} /></Link></section>
    <label className="owner-property-select">{isOfferer ? 'Vaga selecionada' : 'Imóvel selecionado'}<select value={property.id} onChange={(event) => setSelectedProperty(event.target.value)}>{roleProperties.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}</select></label>
    <div className="owner-applicant-toolbar"><div className="owner-applicant-filters" role="group" aria-label="Filtrar interessados">{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}<small>{item === 'Todos' ? propertyApplicants.length : propertyApplicants.filter((applicant) => statusFor(applicant) === item).length}</small></button>)}</div><label className="owner-sort">Ordenar por<select defaultValue="recent"><option value="recent">Mais recentes</option><option value="name">Nome</option></select></label></div>
    <section className="owner-applicant-list" aria-label="Lista de interessados">{filteredApplicants.length ? filteredApplicants.map((applicant) => { const status = statusFor(applicant); const contactId = `estudante-${applicant.name.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-')}`; const chatParams = new URLSearchParams({ contato: contactId, nome: applicant.name, papel: 'Estudante', imovel: property.title }); return <article className="owner-applicant-card" key={`${applicant.property}:${applicant.id}:${applicant.name}`}><span className="owner-applicant-avatar">{applicant.initials}</span><div className="owner-applicant-info"><h3>{applicant.name}</h3><p>{applicant.university}</p><p>{applicant.course} <i /> {applicant.period} <i /> {applicant.gender}</p></div><span className={`owner-applicant-status ${status === 'Em conversa' ? 'chatting' : status === 'Recusado' ? 'declined' : 'waiting'}`}>{status}</span><span className="owner-applicant-chevron" aria-hidden="true">›</span><div className="owner-applicant-actions"><Link to={`/mensagens?${chatParams.toString()}`}><LineIcon name="message" size={14} />Ver chat</Link><Link to={`/usuarios/${applicant.id}`}><LineIcon name="person" size={14} />Ver perfil</Link>{status !== 'Recusado' && <button type="button" onClick={() => rejectApplicant(applicant)} aria-label={`Recusar ${applicant.name}`}>Recusar</button>}</div></article>; }) : <p className="owner-empty">Nenhum interessado neste filtro.</p>}</section>
  </div>;
}

function OwnerRecords({ page, query }) {
  const records = page === 'contratos'
    ? [{ name: 'Apartamento próximo à UFAL', detail: 'Contrato residencial · Ana Beatriz', status: 'Ativo', value: 'R$ 600,00/mês' }, { name: 'Casa compartilhada no Farol', detail: 'Contrato residencial · Lucas Ferreira', status: 'Ativo', value: 'R$ 700,00/mês' }]
    : [{ name: 'Apartamento próximo à UFAL', detail: 'Vencimento em 10/11/2026', status: 'Pendente', value: 'R$ 600,00' }, { name: 'Casa compartilhada no Farol', detail: 'Pagamento recebido em 02/11/2026', status: 'Pago', value: 'R$ 700,00' }];
  const visible = records.filter((record) => `${record.name} ${record.detail} ${record.status}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const title = page === 'contratos' ? 'Contratos' : 'Pagamentos';
  return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name={page === 'contratos' ? 'paperclip' : 'money'} size={28} /></span><div><h1>{title}</h1><p>{page === 'contratos' ? 'Acompanhe os contratos ativos dos seus imóveis.' : 'Consulte os recebimentos e pagamentos dos seus imóveis.'}</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section><section className="owner-record-list">{visible.map((record) => <article className="owner-record-card" key={record.name}><span className="owner-record-icon"><LineIcon name={page === 'contratos' ? 'paperclip' : 'money'} /></span><div><h2>{record.name}</h2><p>{record.detail}</p></div><strong>{record.value}</strong><span className={`owner-status ${record.status === 'Pago' || record.status === 'Ativo' ? 'published' : 'reviewing'}`}>{record.status}</span></article>)}</section></div>;
}

const residentialLeaseClauses = [
  {
    title: 'Partes e legislação aplicável',
    paragraphs: [
      'Pelo presente instrumento, de um lado, o(a) LOCADOR(A), pessoa devidamente identificada no quadro de partes, e, de outro, o(a) LOCATÁRIO(A), também ali identificado(a), celebram a presente locação residencial, regida pela Lei nº 8.245/1991, pelo Código Civil e pelas condições abaixo.',
      'Antes da assinatura, devem ser preenchidos os nomes civis completos, nacionalidade, estado civil, profissão, CPF, documento de identidade, endereço e e-mail de cada parte, além dos dados de eventual representante e respectiva procuração. Os dados demonstrativos exibidos nesta página não substituem a qualificação completa.'
    ]
  },
  {
    title: 'Imóvel, finalidade e vistoria',
    paragraphs: [
      'O(A) LOCADOR(A) dá em locação o imóvel residencial descrito nesta página, incluindo a unidade e a vaga/quarto indicados. O endereço completo, matrícula imobiliária (se disponível), áreas e relação de móveis, equipamentos, chaves e acessórios deverão constar do laudo de vistoria e do inventário, anexos a este contrato.',
      'O imóvel destina-se exclusivamente à moradia do(a) LOCATÁRIO(A) e das pessoas expressamente identificadas neste instrumento. A ocupação por terceiros de forma permanente, ou a alteração da destinação, depende de autorização prévia e escrita do(a) LOCADOR(A). As partes assinarão laudo de entrada, com fotos e registro do estado de conservação, que servirá de referência na devolução.'
    ]
  },
  {
    title: 'Prazo e início da locação',
    paragraphs: [
      'A locação é ajustada por prazo determinado de 12 (doze) meses, com início em [DIA/MÊS/ANO] e término em [DIA/MÊS/ANO]. A entrega das chaves ocorrerá após a assinatura e a confirmação das condições de entrada aqui pactuadas.',
      'Por se tratar de locação residencial escrita por prazo inferior a 30 meses, eventual permanência do(a) LOCATÁRIO(A) após o termo final será regida pelas hipóteses e consequências previstas na Lei nº 8.245/1991, inclusive seu art. 47. A data final, por si só, não autoriza retomada fora das hipóteses legais.'
    ]
  },
  {
    title: 'Aluguel, vencimento e comprovantes',
    paragraphs: [
      'O aluguel mensal é de R$ 700,00 (setecentos reais), com vencimento no dia 5 de cada mês, referente ao período de [PERÍODO DE REFERÊNCIA]. O primeiro vencimento será em [DIA/MÊS/ANO]. A forma de pagamento e os dados de recebimento deverão ser informados por escrito pelo(a) LOCADOR(A); o pagamento será comprovado por recibo, transferência identificada ou comprovante equivalente.',
      'O aluguel não inclui encargos atribuídos ao(à) LOCATÁRIO(A) neste instrumento. O(A) LOCADOR(A) fornecerá recibo discriminado dos valores recebidos. Qualquer alteração de valor, vencimento ou meio de pagamento dependerá de comunicação escrita e não poderá contrariar a legislação aplicável.'
    ]
  },
  {
    title: 'Reajuste do aluguel',
    paragraphs: [
      'O aluguel poderá ser reajustado a cada período mínimo de 12 (doze) meses, contado do início da locação ou do último reajuste, pela variação acumulada do IPCA/IBGE. Se o índice deixar de existir ou não puder ser aplicado, as partes adotarão outro índice oficial que o substitua, respeitada a periodicidade mínima permitida em lei.'
    ]
  },
  {
    title: 'Encargos e despesas',
    paragraphs: [
      'São de responsabilidade do(a) LOCATÁRIO(A) as contas de consumo individualizadas referentes ao período de ocupação, como água, energia, gás e internet, quando contratadas ou mensuráveis separadamente, bem como as despesas ordinárias de condomínio, se houver, mediante apresentação dos respectivos demonstrativos.',
      'São de responsabilidade do(a) LOCADOR(A) os impostos e taxas incidentes sobre a propriedade, o seguro complementar contra incêndio e as despesas extraordinárias de condomínio. A atribuição diferente de encargo que a lei permita transferir deverá ser expressa, específica e preenchida neste instrumento antes da assinatura. Não haverá cobrança sem identificação do período e do respectivo comprovante.'
    ]
  },
  {
    title: 'Garantia locatícia',
    paragraphs: [
      'A modalidade de garantia escolhida pelas partes é: [NENHUMA / CAUÇÃO / FIANÇA / SEGURO-FIANÇA / OUTRA MODALIDADE LEGAL: ESPECIFICAR]. A modalidade, o valor, o prazo, o responsável e as condições de restituição ou execução devem ser completados antes da assinatura. É vedada a exigência de mais de uma modalidade de garantia no mesmo contrato.',
      'Se escolhida caução em dinheiro, seu valor não poderá exceder o equivalente a três meses de aluguel e deverá ser depositado na forma legal, com os rendimentos revertidos ao(à) LOCATÁRIO(A) quando da restituição, descontados apenas débitos ou danos comprovados e exigíveis.'
    ]
  },
  {
    title: 'Obrigações do(a) locador(a)',
    paragraphs: [
      'Compete ao(à) LOCADOR(A) entregar o imóvel em condições de servir ao uso residencial contratado; assegurar o uso pacífico durante a locação; manter a destinação e a forma do imóvel; responder por vícios ou defeitos anteriores à entrega; fornecer recibos e demonstrativos; e realizar os reparos estruturais ou de sua responsabilidade legal.',
      'O(A) LOCADOR(A) poderá vistoriar o imóvel ou apresentá-lo a interessados mediante combinação prévia de dia e horário com o(a) LOCATÁRIO(A), ressalvadas situações urgentes ou hipóteses legais.'
    ]
  },
  {
    title: 'Obrigações do(a) locatário(a)',
    paragraphs: [
      'Compete ao(à) LOCATÁRIO(A) pagar pontualmente aluguel e encargos que lhe cabem; usar o imóvel apenas para a finalidade contratada; zelar pela conservação e limpeza; comunicar prontamente defeitos cuja reparação incumba ao(à) LOCADOR(A), bem como turbações de terceiros; reparar danos causados por si, seus dependentes, visitantes ou prepostos; e devolver o imóvel, ao final, no estado registrado na vistoria inicial, ressalvado o desgaste normal de uso.',
      'Obras, alterações permanentes, instalação de equipamentos que afetem a estrutura e modificações de fachada dependem de autorização prévia e escrita, sem prejuízo das regras legais sobre benfeitorias. O(A) LOCATÁRIO(A) não responderá por deterioração decorrente do uso normal nem por defeitos anteriores à locação.'
    ]
  },
  {
    title: 'Convivência e áreas compartilhadas',
    paragraphs: [
      'Quando a locação envolver quarto ou vaga em moradia compartilhada, o uso das áreas comuns observará as regras escritas entregues ao(à) LOCATÁRIO(A), que não poderão afastar direitos previstos em lei ou neste contrato. Todos deverão respeitar o sossego, a segurança, a higiene e a privacidade dos demais moradores e vizinhos.',
      'Regras específicas sobre visitantes, horários de silêncio, limpeza, divisão de despesas comuns, uso de equipamentos e animais devem ser anexadas ou descritas aqui antes da assinatura: [PREENCHER REGRAS ACORDADAS]. Alterações posteriores dependem de comunicação e concordância dos envolvidos.'
    ]
  },
  {
    title: 'Cessão, sublocação e empréstimo',
    paragraphs: [
      'O(A) LOCATÁRIO(A) não poderá ceder este contrato, sublocar ou emprestar, total ou parcialmente, o imóvel sem consentimento prévio e escrito do(a) LOCADOR(A), conforme a legislação aplicável. A autorização para uma situação específica não implica autorização para situações futuras.'
    ]
  },
  {
    title: 'Atraso, encargos moratórios e cobrança',
    paragraphs: [
      'O atraso no pagamento de quantia vencida sujeitará o(a) LOCATÁRIO(A), após o vencimento e sem necessidade de aviso para constituição em mora, à multa moratória de 2% sobre o valor em atraso, juros de 1% ao mês calculados proporcionalmente aos dias de atraso e correção monetária pelo IPCA/IBGE, sem prejuízo de encargos legais e de cobrança devidamente comprovados.',
      'O recebimento de valor em atraso não implica renúncia a diferenças, novação ou alteração permanente do vencimento. Medidas de cobrança ou despejo somente poderão ocorrer pelos meios e nas hipóteses previstos em lei.'
    ]
  },
  {
    title: 'Rescisão, devolução e multa proporcional',
    paragraphs: [
      'Durante o prazo determinado, o(a) LOCATÁRIO(A) poderá devolver o imóvel mediante aviso escrito e pagamento de multa compensatória equivalente a três aluguéis vigentes, reduzida proporcionalmente ao período já cumprido, conforme o art. 4º da Lei nº 8.245/1991, salvo hipótese legal de dispensa. A transferência do(a) LOCATÁRIO(A), por seu empregador, para prestar serviços em outra localidade poderá dispensar a multa se atendidos os requisitos legais, inclusive aviso escrito com antecedência mínima de 30 dias.',
      'O(A) LOCADOR(A) não poderá reaver o imóvel durante o prazo determinado fora das hipóteses legais. Após eventual prorrogação por prazo indeterminado, a denúncia e o aviso prévio observarão a lei. A locação e os encargos cessam com a efetiva devolução das chaves, sem prejuízo da apuração de valores vencidos e danos comprovados em vistoria final.'
    ]
  },
  {
    title: 'Comunicações, dados e solução de conflitos',
    paragraphs: [
      'As comunicações relativas à locação serão enviadas aos endereços físicos e eletrônicos informados pelas partes, que deverão avisar por escrito qualquer alteração. Mensagens eletrônicas poderão documentar avisos quando for possível comprovar remetente, conteúdo e recebimento, sem substituir formalidade que a lei exigir.',
      'Os dados pessoais serão utilizados na medida necessária à execução e administração da locação, ao cumprimento de obrigações legais e ao exercício regular de direitos, com acesso restrito e observância da legislação de proteção de dados. Fica eleito o foro da situação do imóvel, ressalvadas competências legais obrigatórias.'
    ]
  },
  {
    title: 'Disposições finais e assinaturas',
    paragraphs: [
      'Este instrumento e seus anexos representam o acordo entre as partes. Qualquer alteração deverá ser feita por escrito e assinada por ambas. Integram o contrato o laudo de vistoria, o inventário e as regras de convivência, quando aplicáveis. A tolerância ocasional de uma parte não altera o contrato nem implica renúncia de direito.',
      'As partes declaram que leram e compreenderam as cláusulas e assinam duas vias de igual teor, juntamente com duas testemunhas identificadas abaixo, ou por meio eletrônico que permita verificar a autoria e a integridade do documento. A assinatura deve ocorrer somente depois de preenchidos os campos pendentes e anexados os documentos acordados.'
    ]
  }
];

function ContractPage({ role }) {
  const isOfferer = role === 'ofertante';
  const ownerName = isOfferer ? 'Você · Aluno ofertador' : 'Lucas Souza · Proprietário';
  const tenantName = isOfferer ? 'Carla Santos · Estudante' : 'Ana Beatriz · Estudante';
  return <div className="owner-content contract-content">
    <section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="paperclip" size={28} /></span><div><h1>Contrato de Locação</h1><p>Aqui estão as informações do seu contrato de locação.</p></div><span className="owner-status published">Ativo</span><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <div className="contract-layout"><div className="contract-main-column">
      <section className="contract-property-card"><PropertyPhoto type="house" /><div><h2>Casa compartilhada no Farol</h2><p><LineIcon name="pin" size={14} />Farol · Maceió/AL <Link to="/imoveis/casa-farol">Ver detalhes do imóvel <LineIcon name="arrow" size={14} /></Link></p><div><span>Tipo de imóvel<strong>Casa</strong></span><span>Vaga<strong>Quarto individual</strong></span><span>Duração do contrato<strong>12 meses</strong></span></div></div></section>
      <section className="contract-parties"><h2>Partes do contrato</h2><div><article><small>{isOfferer ? 'Aluno ofertador' : 'Proprietário(a)'}</small><span className="contract-person-avatar">{isOfferer ? 'A' : 'LS'}</span><strong>{ownerName}</strong><p>CPF: ***.***.***-**</p><p>Telefone: (82) 9 9999-9999</p></article><article><small>Aluno(a)</small><span className="contract-person-avatar student">CS</span><strong>{tenantName}</strong><p>Matrícula UFAL: 20251123456</p><p>Telefone: (82) 9 9999-9999</p></article></div></section>
      <section className="contract-terms">
        <h2>Minuta do contrato de locação residencial</h2>
        <p>Leia as cláusulas e complete os campos indicados antes de qualquer assinatura.</p>
        <div className="contract-draft-notice"><strong>Minuta demonstrativa</strong><span>Esta tela usa dados de exemplo e não gera nem valida um contrato assinado. Preencha os dados reais, confirme os valores e anexos com as partes e peça revisão profissional antes de usar.</span></div>
        {residentialLeaseClauses.map((clause, index) => <details key={clause.title}><summary>Cláusula {index + 1} — {clause.title}</summary>{clause.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</details>)}
        <section className="contract-signatures">
          <p>Maceió/AL, ______ de ____________________ de ________.</p>
          <div><span>LOCADOR(A)<small>Nome completo e CPF</small></span><span>LOCATÁRIO(A)<small>Nome completo e CPF</small></span></div>
          <div><span>TESTEMUNHA 1<small>Nome completo · CPF</small></span><span>TESTEMUNHA 2<small>Nome completo · CPF</small></span></div>
        </section>
        <button type="button" onClick={() => window.print()}>Visualizar contrato completo · Imprimir</button>
      </section>
    </div><aside className="contract-payment-column"><section className="contract-payment-card"><h2>Pagamento</h2><p>Confira as condições de pagamento descritas na minuta e confirme os dados diretamente com as partes.</p><div><small>Valor mensal demonstrativo</small><strong>R$ 700,00/mês</strong></div><div><small>Vencimento demonstrativo</small><strong>Todo dia 5 do mês</strong></div></section><section className="contract-history"><h2>Histórico de pagamentos <Link to={`/${isOfferer ? 'ofertante' : 'proprietario'}/pagamentos`} aria-label="Ver pagamentos"><LineIcon name="arrow" size={16} /></Link></h2>{[['Agosto/2026', 'Pendente'], ['Julho/2026', 'Pago'], ['Junho/2026', 'Pago']].map(([month, status]) => <div key={month}><span>{month}</span><span className={`owner-status ${status === 'Pago' ? 'published' : 'reviewing'}`}>{status}</span></div>)}</section></aside></div>
  </div>;
}

export function OwnerDashboardPage({ role = 'proprietario' }) {
  const isOfferer = role === 'ofertante';
  const basePath = isOfferer ? '/ofertante' : '/proprietario';
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const displayName = getDemoUser()?.name;
  const selectedProperty = searchParams.get('imovel') ?? (isOfferer ? offererListings[0].id : properties[0].id);
  const setSelectedProperty = (id) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('imovel', id); return next; });
  const section = pathname.split('/')[2] ?? '';
  let content;
  if (section === 'interessados') content = <InterestedPage query={query} selectedProperty={selectedProperty} setSelectedProperty={setSelectedProperty} role={role} />;
  else if (section === 'contratos') content = <ContractPage role={role} />;
  else if (section === 'pagamentos') content = <OwnerRecords page={section} query={query} />;
  else if (isOfferer && section === 'vagas') content = <OffererVacancies query={query} />;
  else if (section === 'imoveis' || section === 'vagas') content = <div className="owner-content"><div className="owner-section-heading"><h2><LineIcon name="home" size={24} />Meus imóveis</h2><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar imóvel</Link></div><section className="owner-property-list">{properties.map((property) => <PropertyCard key={property.id} property={property} query={query} basePath={basePath} />)}</section></div>;
  else if (isOfferer) content = <OffererHome query={query} displayName={displayName} />;
  else content = <OwnerHome query={query} displayName={displayName} />;

  return <div className={`owner-dashboard${isOfferer ? ' offerer-dashboard' : ''}`}><OwnerSidebar pathname={pathname} role={role} /><main className="owner-main"><OwnerTopbar query={query} setQuery={setQuery} role={role} /><div className="owner-scroll-content">{content}</div></main></div>;
}
