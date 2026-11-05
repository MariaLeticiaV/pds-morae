import { useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { LineIcon } from '../components/LineIcon.jsx';
import { Logo } from '../components/Logo.jsx';
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

function OwnerSidebar({ pathname, role }) {
  const isOfferer = role === 'ofertante';
  const basePath = isOfferer ? '/ofertante' : '/proprietario';
  const navItems = isOfferer ? offererSections : ownerSections;
  return <aside className="dashboard-sidebar owner-sidebar">
    <Link className="dashboard-brand" to={basePath} aria-label={`Moraê, início do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`}><Logo /></Link>
    <nav className="dashboard-nav" aria-label={`Menu do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`}>
      {navItems.map((item) => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `${isActive ? 'selected' : ''}${item.path === '/anunciar' ? ' owner-announce-link' : ''}`}><LineIcon name={item.icon} />{item.label}</NavLink>)}
    </nav>
    <span className="sidebar-version">Moraê · Maceió, AL</span>
  </aside>;
}

function OwnerTopbar({ query, setQuery, role }) {
  const [notice, setNotice] = useState(false);
  const isOfferer = role === 'ofertante';
  return <header className="dashboard-topbar owner-topbar">
    <label className="owner-search"><LineIcon name="search" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isOfferer ? 'Buscar por pessoa, vaga ou contrato...' : 'Buscar por imóvel, interessado ou contrato...'} aria-label={`Buscar no painel do ${isOfferer ? 'aluno ofertador' : 'proprietário'}`} /></label>
    <div className="topbar-actions"><button className="icon-button" type="button" aria-label="Notificações" onClick={() => setNotice((open) => !open)}><LineIcon name="bell" size={21} />{!notice && <i />}</button><span className="topbar-divider" /><button className="profile-menu" type="button" onClick={() => setNotice((open) => !open)}><span className="profile-avatar">{isOfferer ? 'A' : 'P'}</span><span>Olá, {isOfferer ? 'Aluno' : 'Proprietário'}</span><span className="chevron" /></button></div>
    {notice && <div className="owner-notice"><strong>Olá, {isOfferer ? 'Aluno ofertador' : 'Proprietário'}!</strong><span>Você tem interessados aguardando resposta.</span></div>}
  </header>;
}

function PropertyPhoto({ type }) {
  return <div className={`owner-property-photo owner-photo-${type}`} aria-label="Imagem ilustrativa do imóvel"><span className="owner-photo-window" /><span className="owner-photo-sofa" /><span className="owner-photo-table" /><span className="owner-photo-plant" /></div>;
}

function PropertyCard({ property, query = '', basePath = '/proprietario' }) {
  const matchesQuery = !query || `${property.title} ${property.neighborhood} ${property.type}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
  if (!matchesQuery) return null;
  return <article className="owner-property-card">
    <PropertyPhoto type={property.image} />
    <div className="owner-property-info"><div className="owner-property-title-row"><h3>{property.title}</h3><span className={`owner-status ${['Publicado', 'Ativa'].includes(property.status) ? 'published' : 'reviewing'}`}>{property.status}</span></div>
      <p className="owner-property-location"><LineIcon name="pin" size={14} />{property.neighborhood} · Maceió/AL</p>
      <div className="owner-property-meta"><span><LineIcon name="home" size={14} />{property.type}</span><span><LineIcon name="homeGroup" size={14} />{property.room}</span><span><LineIcon name="users" size={14} />{property.residents} moradores</span></div>
      <div className="owner-property-bottom"><strong>{property.rent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<small>/mês</small></strong><span><LineIcon name="users" size={14} />{property.interested} interessados</span></div>
      <div className="owner-property-actions"><Link to={`/anunciar?editar=${property.id}`}><LineIcon name="edit" size={14} />Editar</Link><Link to={`${basePath}/interessados?imovel=${property.id}`}><LineIcon name="users" size={14} />Ver interessados</Link></div>
    </div>
  </article>;
}

function OffererHome({ query }) {
  const profiles = [
    { name: 'Ana Clara', id: 'ana-beatriz', age: 20, tags: ['Organizada', 'Tranquila', 'Não fuma'], initials: 'AC' },
    { name: 'Lucas Ferreira', id: 'carolina-lima', age: 21, tags: ['Responsável', 'Comunicativo', 'Não tem pets'], initials: 'LF' },
    { name: 'Beatriz Lima', id: 'ana-beatriz', age: 22, tags: ['Estudiosa', 'Organizada', 'Tem pets'], initials: 'BL' },
  ].filter((person) => !query || `${person.name} ${person.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const listing = offererListings[0];
  return <div className="owner-content offerer-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="person" size={30} /></span><div><h1>Olá, Ofertador!</h1><p>Aqui você pode encontrar pessoas compatíveis, anunciar sua vaga e acompanhar todo o processo.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="offerer-matches"><h2><LineIcon name="users" size={22} />Pessoas que podem ser compatíveis com você</h2><p>Com base no seu perfil e preferências</p><div className="offerer-match-grid">{profiles.map((person) => <article className="offerer-match-card" key={`${person.name}-${person.id}`}><span className="owner-applicant-avatar">{person.initials}</span><h3>{person.name}</h3><p>{person.age} anos · Estudante</p><div>{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link to={`/usuarios/${person.id}`}>Ver perfil <LineIcon name="arrow" size={14} /></Link></article>)}</div></section>
    <section className="offerer-vacancies-preview"><div className="offerer-subheading"><div><h2><LineIcon name="homeGroup" size={22} />Suas vagas anunciadas</h2><p>Gerencie suas vagas e acompanhe as interações.</p></div><Link to="/ofertante/vagas">Ver todas</Link></div><PropertyCard property={listing} query={query} basePath="/ofertante" /></section>
  </div>;
}

function OffererVacancies({ query }) {
  const [filter, setFilter] = useState('Todas');
  const filters = ['Todas', 'Ativas', 'Em análise', 'Pausadas', 'Encerradas'];
  const filtered = offererListings.filter((listing) => (filter === 'Todas' || listing.status === filter || (filter === 'Pausadas' && listing.status === 'Pausada')) && (!query || `${listing.title} ${listing.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  return <div className="owner-content"><section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="person" size={29} /></span><div><h1>Minhas Vagas</h1><p>Gerencie as vagas que você está disponibilizando para divisão de aluguel.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section><div className="offerer-vacancy-toolbar"><div>{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}<small>{item === 'Todas' ? offererListings.length : offererListings.filter((listing) => listing.status === item).length}</small></button>)}</div><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar nova vaga</Link></div><label className="owner-sort offerer-sort">Ordenar por<select defaultValue="recent"><option value="recent">Mais recentes</option><option value="rent">Menor valor</option></select></label><section className="owner-property-list">{filtered.length ? filtered.map((property) => <PropertyCard key={property.id} property={property} query={query} basePath="/ofertante" />) : <p className="owner-empty">Nenhuma vaga corresponde a este filtro.</p>}</section></div>;
}

function OwnerHome({ query }) {
  const visibleProperties = properties.filter((property) => !query || `${property.title} ${property.neighborhood}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const stats = [
    { label: 'Imóveis anunciados', value: properties.length, icon: 'home', to: '/proprietario/imoveis' },
    { label: 'Interessados', value: applicants.length + 3, icon: 'users', to: '/proprietario/interessados' },
    { label: 'Contratos ativos', value: 2, icon: 'paperclip', to: '/proprietario/contratos' },
    { label: 'Pagamentos pendentes', value: 1, icon: 'money', to: '/proprietario/pagamentos', pink: true },
  ];
  return <div className="owner-content">
    <section className="owner-welcome"><span className="owner-welcome-icon"><LineIcon name="homeGroup" size={29} /></span><div><h1>Olá, Proprietário!</h1><p>Acompanhe seus imóveis, interessados e recebimentos em um só lugar.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-stats" aria-label="Resumo da conta">{stats.map((stat) => <Link className={`owner-stat${stat.pink ? ' pink' : ''}`} to={stat.to} key={stat.label}><span><LineIcon name={stat.icon} size={19} /></span><strong>{stat.label}</strong><b>{stat.value}<LineIcon name="arrow" size={16} /></b></Link>)}</section>
    <div className="owner-section-heading"><h2><LineIcon name="home" size={24} />Meus imóveis</h2><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar imóvel</Link></div>
    <section className="owner-property-list" aria-label="Imóveis anunciados">{visibleProperties.length ? visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />) : <p className="owner-empty">Nenhum imóvel corresponde à busca.</p>}</section>
  </div>;
}

function InterestedPage({ query, selectedProperty, setSelectedProperty, role }) {
  const isOfferer = role === 'ofertante';
  const roleProperties = isOfferer ? offererListings : properties;
  const roleApplicants = isOfferer ? offererApplicants : applicants;
  const [filter, setFilter] = useState('Todos');
  const property = roleProperties.find(({ id }) => id === selectedProperty) ?? roleProperties[0];
  const filteredApplicants = roleApplicants.filter((applicant) => (applicant.property === property.id) && (filter === 'Todos' || applicant.status === filter) && (!query || `${applicant.name} ${applicant.course} ${applicant.university}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))));
  const filters = ['Todos', 'Em conversa', 'Aguardando resposta', 'Recusado'];
  return <div className="owner-content">
    <section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="users" size={28} /></span><div><h1>{isOfferer ? 'Interessados na sua vaga' : 'Interessados no seu imóvel'}</h1><p>Pessoas que demonstraram interesse no seu anúncio e estão em contato com você.</p></div><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <section className="owner-selected-property"><PropertyPhoto type={property.image} /><div><h2>{property.title}</h2><p><LineIcon name="pin" size={14} />{property.neighborhood} · Maceió/AL</p><div><span><LineIcon name="home" size={13} />{property.type}</span><span><LineIcon name="homeGroup" size={13} />{property.room}</span><span><LineIcon name="users" size={13} />{property.residents} moradores</span></div></div><span className="owner-status published">Ativo</span><Link to="/anunciar">Ver anúncio <LineIcon name="arrow" size={15} /></Link></section>
    <label className="owner-property-select">{isOfferer ? 'Vaga selecionada' : 'Imóvel selecionado'}<select value={property.id} onChange={(event) => setSelectedProperty(event.target.value)}>{roleProperties.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}</select></label>
    <div className="owner-applicant-toolbar"><div className="owner-applicant-filters" role="group" aria-label="Filtrar interessados">{filters.map((item) => <button className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}<small>{item === 'Todos' ? roleApplicants.filter((applicant) => applicant.property === property.id).length : roleApplicants.filter((applicant) => applicant.property === property.id && applicant.status === item).length}</small></button>)}</div><label className="owner-sort">Ordenar por<select defaultValue="recent"><option value="recent">Mais recentes</option><option value="name">Nome</option></select></label></div>
    <section className="owner-applicant-list" aria-label="Lista de interessados">{filteredApplicants.length ? filteredApplicants.map((applicant, index) => <article className="owner-applicant-card" key={`${applicant.name}-${index}`}><span className="owner-applicant-avatar">{applicant.initials}</span><div className="owner-applicant-info"><h3>{applicant.name}</h3><p>{applicant.university}</p><p>{applicant.course} <i /> {applicant.period} <i /> {applicant.gender}</p></div><span className={`owner-applicant-status ${applicant.status === 'Em conversa' ? 'chatting' : applicant.status === 'Recusado' ? 'declined' : 'waiting'}`}>{applicant.status}</span><span className="owner-applicant-chevron" aria-hidden="true">›</span><div className="owner-applicant-actions"><Link to="/mensagens"><LineIcon name="message" size={14} />Ver chat</Link><Link to={`/usuarios/${applicant.id}`}><LineIcon name="person" size={14} />Ver perfil</Link></div></article>) : <p className="owner-empty">Nenhum interessado neste filtro.</p>}</section>
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

function ContractPage({ role }) {
  const isOfferer = role === 'ofertante';
  const ownerName = isOfferer ? 'Você · Aluno ofertador' : 'Lucas Souza · Proprietário';
  const tenantName = isOfferer ? 'Carla Santos · Estudante' : 'Ana Beatriz · Estudante';
  return <div className="owner-content contract-content">
    <section className="owner-welcome compact"><span className="owner-welcome-icon"><LineIcon name="paperclip" size={28} /></span><div><h1>Contrato de Locação</h1><p>Aqui estão as informações do seu contrato de locação.</p></div><span className="owner-status published">Ativo</span><i className="owner-orbit owner-pink" /><i className="owner-orbit owner-green" /></section>
    <div className="contract-layout"><div className="contract-main-column">
      <section className="contract-property-card"><PropertyPhoto type="house" /><div><h2>Casa compartilhada no Farol</h2><p><LineIcon name="pin" size={14} />Farol · Maceió/AL <Link to="/anunciar">Ver detalhes do imóvel <LineIcon name="arrow" size={14} /></Link></p><div><span>Tipo de imóvel<strong>Apartamento</strong></span><span>Vaga<strong>Quarto individual</strong></span><span>Duração do contrato<strong>12 meses</strong></span></div></div></section>
      <section className="contract-parties"><h2>Partes do contrato</h2><div><article><small>{isOfferer ? 'Aluno ofertador' : 'Proprietário(a)'}</small><span className="contract-person-avatar">{isOfferer ? 'A' : 'LS'}</span><strong>{ownerName}</strong><p>CPF: ***.***.***-**</p><p>Telefone: (82) 9 9999-9999</p></article><article><small>Aluno(a)</small><span className="contract-person-avatar student">CS</span><strong>{tenantName}</strong><p>Matrícula UFAL: 20251123456</p><p>Telefone: (82) 9 9999-9999</p></article></div></section>
      <section className="contract-terms"><h2>Documento do contrato</h2><p>Confira todos os termos e condições da locação.</p>{['O objeto do contrato', 'Prazo de locação', 'Obrigação das partes', 'Rescisão e penalidades'].map((term, index) => <details key={term}><summary>{index + 1}. {term}</summary><p>As partes concordam com as condições descritas neste contrato de locação, incluindo conservação do imóvel, pagamento em dia e comunicação entre locador e locatário.</p></details>)}<button type="button" onClick={() => window.print()}>Visualizar contrato completo · Imprimir</button></section>
    </div><aside className="contract-payment-column"><section className="contract-payment-card"><h2>Pagamento</h2><p>O pagamento é feito pela plataforma, de forma segura e transparente.</p><div><small>Valor do aluguel</small><strong>R$ 800,00/mês</strong></div><div><small>Vencimento</small><strong>Todo dia 5 do mês</strong></div><h3>Formas de pagamento</h3><div className="contract-payment-methods"><span>PIX</span><span>Boleto</span><span>Cartão</span></div><p>O pagamento é liberado ao proprietário após a confirmação.</p></section><section className="contract-history"><h2>Histórico de pagamentos <Link to={`/${isOfferer ? 'ofertante' : 'proprietario'}/pagamentos`} aria-label="Ver pagamentos"><LineIcon name="arrow" size={16} /></Link></h2>{[['Agosto/2026', 'Pendente'], ['Julho/2026', 'Pago'], ['Junho/2026', 'Pago']].map(([month, status]) => <div key={month}><span>{month}</span><span className={`owner-status ${status === 'Pago' ? 'published' : 'reviewing'}`}>{status}</span></div>)}</section></aside></div>
  </div>;
}

export function OwnerDashboardPage({ role = 'proprietario' }) {
  const isOfferer = role === 'ofertante';
  const basePath = isOfferer ? '/ofertante' : '/proprietario';
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const selectedProperty = searchParams.get('imovel') ?? (isOfferer ? offererListings[0].id : properties[0].id);
  const setSelectedProperty = (id) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('imovel', id); return next; });
  const section = pathname.split('/')[2] ?? '';
  let content;
  if (section === 'interessados') content = <InterestedPage query={query} selectedProperty={selectedProperty} setSelectedProperty={setSelectedProperty} role={role} />;
  else if (section === 'contratos') content = <ContractPage role={role} />;
  else if (section === 'pagamentos') content = <OwnerRecords page={section} query={query} />;
  else if (isOfferer && section === 'vagas') content = <OffererVacancies query={query} />;
  else if (section === 'imoveis' || section === 'vagas') content = <div className="owner-content"><div className="owner-section-heading"><h2><LineIcon name="home" size={24} />Meus imóveis</h2><Link className="owner-primary-button" to="/anunciar"><span aria-hidden="true">＋</span>Anunciar imóvel</Link></div><section className="owner-property-list">{properties.map((property) => <PropertyCard key={property.id} property={property} query={query} basePath={basePath} />)}</section></div>;
  else if (isOfferer) content = <OffererHome query={query} />;
  else content = <OwnerHome query={query} />;

  return <div className={`owner-dashboard${isOfferer ? ' offerer-dashboard' : ''}`}><OwnerSidebar pathname={pathname} role={role} /><main className="owner-main"><OwnerTopbar query={query} setQuery={setQuery} role={role} /><div className="owner-scroll-content">{content}</div></main></div>;
}
