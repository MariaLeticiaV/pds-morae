import { useMemo, useState } from 'react';
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom';
import { getAdministratorSession, logoutAdministrator } from '../services/adminAuth.js';
import { Logo } from '../components/Logo.jsx';
import './AdminPanelPage.css';

const navigation = [
  { path: '/admin', label: 'Visão geral', icon: '⌂' },
  { path: '/admin/usuarios', label: 'Usuários', icon: '○' },
  { path: '/admin/anuncios', label: 'Anúncios', icon: '□' },
  { path: '/admin/recomendacoes', label: 'Recomendações', icon: '◷' },
  { path: '/admin/verificacoes', label: 'Verificações', icon: '☑' },
  { path: '/admin/registros', label: 'Registros', icon: '☷' },
  { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
];

const initialUsers = [
  { id: 'vnk-1038', name: 'Bianca Martins', email: 'bianca.m@ufal.br', profile: 'Aluna buscadora', institution: 'UFAL', status: 'Em análise', date: '12 nov 2026', initials: 'BM' },
  { id: 'vnk-1029', name: 'Lucas Nascimento', email: 'lucas.n@ufal.br', profile: 'Aluno-anfitrião', institution: 'UFAL', status: 'Verificado', date: '11 nov 2026', initials: 'LN' },
  { id: 'vnk-1036', name: 'João Pedro Reis', email: 'joao.p@aluno.ifal.edu.br', profile: 'Aluno-organizador', institution: 'IFAL', status: 'Em análise', date: '10 nov 2026', initials: 'JR' },
  { id: 'usr-0541', name: 'Mariana Costa', email: 'mariana.costa@email.com', profile: 'Ofertante de imóvel', institution: '—', status: 'Não se aplica', date: '09 nov 2026', initials: 'MC' },
  { id: 'vnk-1032', name: 'Ana Martins', email: 'ana.m@ufal.br', profile: 'Aluna buscadora', institution: 'UFAL', status: 'Em análise', date: '08 nov 2026', initials: 'AM' },
  { id: 'vnk-1024', name: 'Caio Ribeiro', email: 'caio.r@ufal.br', profile: 'Aluno-anfitrião', institution: 'UFAL', status: 'Verificado', date: '07 nov 2026', initials: 'CR' },
];

const initialAds = [
  { id: 'IMO-0318', kind: 'IMÓVEL', title: 'Apartamento compartilhado · Farol', owner: 'Roberto Almeida', detail: '3 quartos · 2 banheiros', summary: 'Anunciante: Roberto A. · próximo à UFAL', warning: 'Caução: 3 meses · repasse futuro: não informado', state: 'Em revisão' },
  { id: 'VAG-0882', kind: 'REPASSE', title: 'Vaga em república · Tabuleiro', owner: 'Pedro Rocha', detail: 'Quarto individual · vaga imediata', summary: 'Anunciante: Pedro R. · saída no meio do semestre', warning: 'Condição de autorização do locador não informada', state: 'Complemento' },
  { id: 'IMO-0314', kind: 'IMÓVEL', title: 'Quarto próximo à UFAL · Cidade Universitária', owner: 'Mariana Costa', detail: 'Quarto individual · mobiliado', summary: 'Anunciante: Mariana C. · modalidade residencial', warning: 'Caução: 2 meses · repasse pré-autorizado: sim', state: 'Dados completos' },
];

const initialRecommendations = [
  { id: 'REC-0185', person: 'Pedro Souza', author: 'Marina Alves', profile: 'Aluno-anfitrião · UFAL', status: 'Em conferência', message: 'Pedro cuida dos espaços comuns e mantém uma comunicação clara durante a nossa convivência.' },
  { id: 'REC-0182', person: 'Lucas Nascimento', author: 'Ana Clara', profile: 'Aluno-anfitrião · UFAL', status: 'Publicada', message: 'Uma convivência muito boa e responsável.' },
  { id: 'REC-0179', person: 'Mariana Costa', author: 'Luiza Barbosa', profile: 'Ofertante de imóvel', status: 'Conferir vínculo', message: 'Moramos juntas e tivemos uma boa experiência.' },
  { id: 'REC-0175', person: 'João Nascimento', author: 'Caio Ribeiro', profile: 'Aluno-organizador · IFAL', status: 'Publicada', message: 'Organizado, atencioso e respeitoso com a casa.' },
];

const initialRecords = [
  { date: '13 nov 2026', time: '10:24', owner: 'Carla Mendes', initials: 'CM', action: 'Vínculo universitário aprovado', area: 'Verificações', reference: 'VNK-1038', result: 'Concluído' },
  { date: '13 nov 2026', time: '10:11', owner: 'Rafael Lima', initials: 'RL', action: 'Recomendação confirmada', area: 'Recomendações', reference: 'REC-0185', result: 'Concluído' },
  { date: '13 nov 2026', time: '09:58', owner: 'Sistema Moraê', initials: '+', action: 'E-mail institucional confirmado', area: 'Usuários', reference: 'VNK-1044', result: 'Automático' },
  { date: '12 nov 2026', time: '17:48', owner: 'Carla Mendes', initials: 'CM', action: 'Ajuste solicitado ao anunciante', area: 'Anúncios', reference: 'IMO-0318', result: 'Aguardando' },
  { date: '12 nov 2026', time: '16:10', owner: 'Rafael Lima', initials: 'RL', action: 'Consentimento de exibição confirmado', area: 'Recomendações', reference: 'REC-0182', result: 'Concluído' },
  { date: '12 nov 2026', time: '15:42', owner: 'Rafael Lima', initials: 'RL', action: 'Domínio institucional atualizado', area: 'Verificações', reference: 'UFAL', result: 'Concluído' },
];

const pageInfo = {
  '': ['Visão geral', 'Acompanhe as revisões e mantenha a comunidade Moraê segura.'],
  usuarios: ['Usuários e vínculos', 'Confira o vínculo acadêmico e acompanhe as contas cadastradas.'],
  anuncios: ['Anúncios em revisão', 'Confira informações essenciais antes de liberar imóveis e vagas.'],
  recomendacoes: ['Recomendações', 'Acompanhe recomendações de convivência e os selos exibidos nos perfis.'],
  verificacoes: ['Verificações de vínculo', 'Revise solicitações de vínculo acadêmico enviadas por estudantes.'],
  registros: ['Registros de atividade', 'Consulte ações da equipe e eventos do sistema em um histórico único.'],
  configuracoes: ['Configurações', 'Gerencie instituições, recomendações e acesso da equipe.'],
};

function Badge({ children, tone = 'purple' }) {
  return <span className={`admin-badge ${tone}`}>{children}</span>;
}

function Stats({ items }) {
  return (
    <div className="admin-stats">
      {items.map((item) => (
        <article className="admin-stat-card" key={item.label}>
          <span>{item.label}</span>
          <div><strong>{item.value}</strong>{item.note && <small>{item.note}</small>}</div>
          {item.badge && <Badge tone={item.tone}>{item.badge}</Badge>}
        </article>
      ))}
    </div>
  );
}

function Avatar({ children, tone = 'mint' }) {
  return <span className={`admin-avatar ${tone}`}>{children}</span>;
}

export function AdminPanelPage() {
  const session = getAdministratorSession();
  const location = useLocation();
  const path = location.pathname.replace(/^\/admin\/?/, '');
  const [users, setUsers] = useState(initialUsers);
  const [ads, setAds] = useState(initialAds);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAd, setSelectedAd] = useState(initialAds[0].id);
  const [selectedRecommendation, setSelectedRecommendation] = useState(initialRecommendations[0].id);
  const [userStatus, setUserStatus] = useState('Todos');
  const [userInstitution, setUserInstitution] = useState('Todas instituições');
  const [userProfile, setUserProfile] = useState('Todos os perfis');
  const [adKind, setAdKind] = useState('Tipo de oferta');
  const [recommendationStatus, setRecommendationStatus] = useState('Status');
  const [settings, setSettings] = useState({ badge: true, review: true, consent: true });

  const [pageKey, userId] = path.split('/');
  const selectedUser = users.find((user) => user.id === userId) || users[0];
  const title = pageKey === 'usuarios' && userId ? 'Analisar vínculo' : (pageInfo[pageKey] || pageInfo[''])[0];
  const subtitle = pageInfo[pageKey]?.[1] || pageInfo[''][1];
  const searchValue = search.trim().toLocaleLowerCase('pt-BR');
  const filteredUsers = useMemo(
    () => users.filter((user) => {
      const matchesSearch = `${user.name} ${user.email} ${user.institution}`.toLocaleLowerCase('pt-BR').includes(searchValue);
      const matchesInstitution = userInstitution === 'Todas instituições' || user.institution === userInstitution;
      const matchesProfile = userProfile === 'Todos os perfis' || user.profile === userProfile;
      return matchesSearch && matchesInstitution && matchesProfile && (userStatus === 'Todos' || user.status === userStatus);
    }),
    [searchValue, userInstitution, userProfile, userStatus, users],
  );
  const filteredAds = ads.filter((ad) => (
    `${ad.id} ${ad.title} ${ad.owner}`.toLocaleLowerCase('pt-BR').includes(searchValue) &&
    (adKind === 'Tipo de oferta' || ad.kind === adKind.toLocaleUpperCase('pt-BR'))
  ));
  const filteredRecommendations = recommendations.filter((item) => (
    `${item.id} ${item.person} ${item.author}`.toLocaleLowerCase('pt-BR').includes(searchValue) &&
    (recommendationStatus === 'Status' || item.status === recommendationStatus)
  ));
  const activeAd = ads.find((ad) => ad.id === selectedAd) || ads[0];
  const activeRecommendation = recommendations.find((item) => item.id === selectedRecommendation) || recommendations[0];
  const reviewerName = session?.login.replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('pt-BR')) || '';
  const initials = reviewerName.split(' ').map((part) => part[0]).slice(0, 2).join('');

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4500);
  }

  function updateUserStatus(status) {
    setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, status } : user));
    showNotice(`Solicitação de ${selectedUser.name}: ${status.toLocaleLowerCase('pt-BR')}. A ação foi registrada nesta sessão do navegador.`);
  }

  function updateAdState(state) {
    setAds((current) => current.map((ad) => ad.id === activeAd.id ? { ...ad, state } : ad));
    showNotice(`Anúncio ${activeAd.id}: ${state.toLocaleLowerCase('pt-BR')}. A alteração está nesta sessão do navegador.`);
  }

  function updateRecommendationStatus(status) {
    setRecommendations((current) => current.map((item) => item.id === activeRecommendation.id ? { ...item, status } : item));
    showNotice(`Recomendação ${activeRecommendation.id}: ${status.toLocaleLowerCase('pt-BR')}. A alteração está nesta sessão do navegador.`);
  }

  function exportRecords() {
    const rows = [
      ['Data', 'Hora', 'Responsável', 'Ação', 'Área', 'Referência', 'Resultado'],
      ...initialRecords.map((record) => [record.date, record.time, record.owner, record.action, record.area, record.reference, record.result]),
    ];
    const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registros-morae.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin" aria-label="Moraê, painel administrativo">
          <Logo />
          <span className="admin-brand-text"><strong>Moraê</strong><small>PAINEL ADMINISTRATIVO</small></span>
        </Link>
        <span className="admin-nav-caption">ESPAÇO DE TRABALHO</span>
        <nav className="admin-navigation" aria-label="Administração">
          {navigation.slice(0, 6).map((item) => (
            <NavLink
              end={item.path === '/admin'}
              key={item.path}
              onClick={() => setSearch('')}
              to={item.path}
              className={({ isActive }) => `admin-nav-link${isActive || (item.path === '/admin/usuarios' && path.startsWith('usuarios/')) ? ' active' : ''}`}
            >
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <span className="admin-nav-caption admin-system-caption">SISTEMA</span>
        <NavLink className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} to="/admin/configuracoes">
          <span>⚙</span>Configurações
        </NavLink>
        <div className="admin-sidebar-bottom">
          <div className="admin-trust-card"><strong><span>✓</span> Equipe de confiança</strong><p>Revisões ficam registradas para dar transparência.</p></div>
          <div className="admin-sidebar-user"><Avatar>{initials}</Avatar><span><strong>{reviewerName}</strong><small>Administradora</small></span></div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-crumb"><Link to="/admin">Moraê</Link><span>›</span><strong>{title}</strong></div>
          <label className="admin-global-search"><span>⌕</span><input aria-label="Buscar no painel" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no painel" value={search} /></label>
          <button className="admin-notification" onClick={() => showNotice('Você está em dia com as notificações do painel.')} title="Notificações" type="button">♧</button>
          <div className="admin-top-user"><Avatar>{initials}</Avatar><span><strong>{reviewerName}</strong><small>Administradora</small></span></div>
          <button className="admin-logout" onClick={() => { logoutAdministrator(); window.location.assign('/login'); }} type="button">Sair</button>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div><h1>{title}</h1><p>{subtitle}</p></div>
            {pageKey === '' && <button className="admin-primary-button" onClick={() => showNotice('O backend ainda não oferece uma operação para criar comunicados.')} type="button">＋ Novo comunicado</button>}
            {pageKey === 'usuarios' && !userId && <button className="admin-primary-button" onClick={() => showNotice('O backend ainda não oferece uma operação para cadastrar usuários pelo painel.')} type="button">＋ Adicionar usuário</button>}
            {pageKey === 'anuncios' && <button className="admin-outline-button" onClick={() => showNotice('Filtros aplicados aos anúncios exibidos nesta página.')} type="button">☷ Filtros</button>}
            {pageKey === 'usuarios' && userId && <Link className="admin-outline-button" to="/admin/usuarios">‹ Voltar à lista</Link>}
          </div>

          {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} type="button" aria-label="Fechar aviso">×</button></div>}

          {pageKey === '' && <Overview showNotice={showNotice} />}
          {pageKey === 'usuarios' && !userId && (
            <UsersPage
              users={filteredUsers}
              status={userStatus}
              onStatus={setUserStatus}
              institution={userInstitution}
              onInstitution={setUserInstitution}
              profile={userProfile}
              onProfile={setUserProfile}
              search={search}
              onSearch={setSearch}
            />
          )}
          {pageKey === 'usuarios' && userId && (
            <UserReviewPage user={selectedUser} onDecision={updateUserStatus} onNotice={showNotice} />
          )}
          {pageKey === 'anuncios' && (
            <AdsPage
              ads={filteredAds}
              activeAd={activeAd}
              onSelect={setSelectedAd}
              onAction={updateAdState}
              search={search}
              onSearch={setSearch}
              kind={adKind}
              onKind={setAdKind}
            />
          )}
          {pageKey === 'recomendacoes' && (
            <RecommendationsPage
              items={filteredRecommendations}
              active={activeRecommendation}
              onSelect={setSelectedRecommendation}
              onAction={updateRecommendationStatus}
              search={search}
              onSearch={setSearch}
              status={recommendationStatus}
              onStatus={setRecommendationStatus}
            />
          )}
          {pageKey === 'verificacoes' && <VerificationsPage users={users} search={search} onSearch={setSearch} />}
          {pageKey === 'registros' && <RecordsPage onExport={exportRecords} search={search} onSearch={setSearch} />}
          {pageKey === 'configuracoes' && <SettingsPage settings={settings} setSettings={setSettings} onSave={() => showNotice('Preferências salvas nesta sessão do navegador.')} />}
          {!['', 'usuarios', 'anuncios', 'recomendacoes', 'verificacoes', 'registros', 'configuracoes'].includes(pageKey) && (
            <Overview showNotice={showNotice} />
          )}
        </div>
      </div>
    </div>
  );
}

function Overview({ showNotice }) {
  return (
    <>
      <Stats items={[
        { label: 'Contas ativas', value: '1.284', note: 'nos últimos 30 dias', badge: '+12,4%', tone: 'green' },
        { label: 'Vínculos em análise', value: '18', note: 'aguardando revisão', badge: '7 urgentes' },
        { label: 'Anúncios em revisão', value: '12', note: '8 imóveis · 4 vagas para repasse' },
        { label: 'Perfis bem recomendados', value: '286', note: 'nesta semana', badge: '42 novas', tone: 'pink' },
      ]} />
      <div className="admin-overview-grid">
        <section className="admin-panel admin-review-queue">
          <div className="admin-panel-heading"><div><h2>Fila de revisão</h2><p>Itens que precisam de uma decisão da equipe.</p></div><Link to="/admin/verificacoes">Ver todas</Link></div>
          <Link className="admin-queue-row" to="/admin/usuarios/vnk-1038"><span className="admin-round-icon purple">◷</span><span><strong>Verificação de vínculo universitário</strong><small>7 estudantes aguardam análise da documentação.</small></span><Badge>7 pendentes</Badge></Link>
          <Link className="admin-queue-row" to="/admin/anuncios"><span className="admin-round-icon purple">☷</span><span><strong>Anúncios com dados incompletos</strong><small>3 precisam informar as condições de repasse da vaga.</small></span><Badge>3 anúncios</Badge></Link>
          <Link className="admin-queue-row" to="/admin/recomendacoes"><span className="admin-round-icon pink">!</span><span><strong>Indicações aguardando conferência</strong><small>2 recomendações aguardam conferência da convivência.</small></span><Badge tone="pink">2 novas</Badge></Link>
          <h3 className="admin-activity-title">ÚLTIMAS AÇÕES</h3>
          <ActivityItem title="Vínculo universitário aprovado" detail="Equipe de moderação · conta de estudante" time="há 18 min" />
          <ActivityItem title="Anunciante recebeu pedido de ajuste" detail="Equipe de anúncios · repasse de vaga" time="há 42 min" />
          <ActivityItem title="Novo anúncio enviado para revisão" detail="Equipe de anúncios · imóvel próximo ao campus" time="há 1 h" />
          <p className="admin-illustration-note">Dados demonstrativos até a disponibilização das rotas administrativas.</p>
        </section>
        <div className="admin-overview-side">
          <section className="admin-panel admin-chart-panel">
            <div className="admin-panel-heading"><div><h2>Ritmo de revisões</h2><p>Últimos 7 dias</p></div><Badge tone="neutral">7 dias⌄</Badge></div>
            <p className="admin-chart-total"><strong>142</strong> itens revisados</p>
            <div className="admin-chart" aria-label="Gráfico ilustrativo de revisões semanais">
              {[63, 78, 55, 86, 70, 96, 78].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index]}</small></div>)}
            </div>
            <div className="admin-chart-legend"><span>● Concluídas</span><strong>108</strong></div>
          </section>
          <section className="admin-panel">
            <h2>Pontos de atenção</h2>
            <AttentionItem color="pink" title="Vínculos sem retorno há mais de 48 h" count="4" />
            <AttentionItem color="magenta" title="Vínculos de convivência para confirmar" count="2" />
            <AttentionItem color="purple" title="Anúncios aguardando complemento" count="3" />
            <p className="admin-illustration-note">Dados ilustrativos para prototipação.</p>
          </section>
        </div>
      </div>
      <p className="admin-illustration-note admin-global-note">Os números do painel são demonstrativos; a API atual ainda não disponibiliza dados administrativos.</p>
    </>
  );
}

function ActivityItem({ title, detail, time }) {
  return <div className="admin-activity-item"><span /><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div>;
}

function AttentionItem({ color, title, count }) {
  return <div className="admin-attention-item"><i className={color} /><span>{title}</span><strong>{count}</strong></div>;
}

function UsersPage({ users, status, onStatus, institution, onInstitution, profile, onProfile, search, onSearch }) {
  return (
    <>
      <Stats items={[
        { label: 'STATUS DO VÍNCULO', value: '18', note: 'aguardando análise' },
        { label: 'VERIFICADOS', value: '936', note: 'estudantes' },
        { label: 'INSTITUIÇÕES', value: '12', note: 'com domínio cadastrado' },
        { label: 'ATENÇÃO', value: '7', note: 'aguardando há mais de 48 h', badge: 'Priorize os pedidos mais antigos.' },
      ]} />
      <section className="admin-panel admin-table-panel">
        <div className="admin-filterbar">
          <label className="admin-search-input"><span>⌕</span><span className="sr-only">Buscar pessoa</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" value={search} /></label>
          <select aria-label="Filtrar instituição" onChange={(event) => onInstitution(event.target.value)} value={institution}><option>Todas instituições</option><option>UFAL</option><option>IFAL</option></select>
          <select aria-label="Filtrar perfil" onChange={(event) => onProfile(event.target.value)} value={profile}><option>Todos os perfis</option><option>Aluna buscadora</option><option>Aluno-anfitrião</option></select>
          <select aria-label="Filtrar vínculo" onChange={(event) => onStatus(event.target.value)} value={status}><option>Todos</option><option>Em análise</option><option>Verificado</option><option>Não se aplica</option></select>
          <button className="admin-outline-button" onClick={() => window.print()} type="button">▣ Exportar lista</button>
        </div>
        <div className="admin-table-scroll"><table><thead><tr><th>PESSOA</th><th>PERFIL</th><th>INSTITUIÇÃO</th><th>VÍNCULO</th><th>CADASTRO</th><th /></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}><td><div className="admin-person-cell"><Avatar tone="pink">{user.initials}</Avatar><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.profile}</td><td>{user.institution}</td><td><Badge tone={user.status === 'Verificado' ? 'green' : user.status === 'Não se aplica' ? 'neutral' : 'purple'}>{user.status}</Badge></td><td>{user.date}</td><td><Link className="admin-row-link" to={`/admin/usuarios/${user.id}`}>{user.status === 'Em análise' ? 'Analisar →' : 'Ver perfil'}</Link></td></tr>)}</tbody>
        </table></div>
        {users.length === 0 && <p className="admin-empty">Nenhum usuário corresponde à busca.</p>}
        <div className="admin-table-footer"><span>Exibindo {users.length} de 1.284 contas</span><div>Linhas por página <select aria-label="Linhas por página"><option>10</option><option>25</option></select><button className="selected" type="button">1</button><button type="button">2</button></div></div>
        <p className="admin-illustration-note">Lista ilustrativa: a API administrativa de usuários ainda não está disponível.</p>
      </section>
    </>
  );
}

function UserReviewPage({ user, onDecision, onNotice }) {
  return (
    <div className="admin-review-layout">
      <div className="admin-review-main">
        <section className="admin-panel admin-request-card">
          <div className="admin-request-person"><Avatar tone="pink">{user.initials}</Avatar><div><small>SOLICITAÇÃO VNK-1038</small><h2>{user.name}</h2><p>{user.profile} · cadastrada em {user.date}</p></div><Badge>{user.status}</Badge></div>
          <div className="admin-request-meta"><span>Instituição <strong>{user.institution}</strong></span><span>Curso <strong>Pedagogia</strong></span><span>Ingresso <strong>2026</strong></span></div>
        </section>
        <section className="admin-panel">
          <h2>Evidências de vínculo</h2><p className="admin-panel-subtitle">Dados fornecidos pela pessoa e confirmação pelo e-mail institucional.</p>
          <Evidence title="E-mail institucional confirmado" detail={`${user.email} · confirmação concluída em 12 nov, 16:24`} status="Confirmado" />
          <Evidence title="Domínio institucional reconhecido" detail={`${user.institution.toLowerCase()}.br corresponde à instituição selecionada.`} status="Conferido" />
        </section>
        <section className="admin-panel">
          <h2>Histórico de análise</h2>
          <div className="admin-timeline"><strong>Confirmação enviada para o e-mail informado</strong><small>12 nov 2026 · 16:21 · Sistema Moraê</small><strong>Pessoa confirmou o endereço institucional</strong><small>12 nov 2026 · 16:24 · Aguardando conferência administrativa</small></div>
          <div className="admin-comment">Nenhum comentário interno registrado neste pedido.</div>
        </section>
      </div>
      <aside className="admin-panel admin-decision-panel">
        <h2>Resumo da validação</h2><p className="admin-panel-subtitle">Revise as etapas antes de concluir.</p>
        <Evidence compact title="E-mail pertence ao domínio da UFAL" detail="Confirmação reconhecida" />
        <Evidence compact title="Dados da instituição conferidos" detail={`Instituição selecionada: ${user.institution}`} />
        <Evidence compact pending title="Revisão por uma pessoa" detail="Etapa atual" />
        <hr /><h3>DECISÃO</h3>
        <textarea aria-label="Observação interna" placeholder="Observação interna (opcional)" />
        <button className="admin-outline-button full" onClick={() => onNotice('Solicitação de comprovação adicional registrada localmente.')} type="button">Solicitar outra comprovação</button>
        <button className="admin-primary-button full" onClick={() => onDecision('Verificado')} type="button">Aprovar vínculo</button>
        <button className="admin-outline-button full" onClick={() => onDecision('Recusado')} type="button">Recusar solicitação</button>
        <div className="admin-info-box"><strong>ⓘ Transparência da revisão</strong><p>A decisão e seu responsável ficam registrados. O selo só aparece após a conclusão da verificação.</p></div>
      </aside>
    </div>
  );
}

function Evidence({ title, detail, status, compact = false, pending = false }) {
  return <div className={`admin-evidence${compact ? ' compact' : ''}`}><span className={pending ? 'pending' : ''}>{pending ? '!' : '✓'}</span><div><strong>{title}</strong><small>{detail}</small></div>{status && <Badge tone="green">{status}</Badge>}</div>;
}

function AdsPage({ ads, activeAd, onSelect, onAction, search, onSearch, kind, onKind }) {
  return (
    <>
      <Stats items={[
        { label: 'AGUARDANDO MODERAÇÃO', value: '12', note: 'anúncios' },
        { label: 'IMÓVEIS', value: '8' },
        { label: 'VAGAS PARA REPASSE', value: '4' },
        { label: 'INFORMAÇÃO COMPLEMENTAR', value: '3', note: 'anúncios precisam de revisão' },
      ]} />
      <div className="admin-review-layout ads-layout">
        <section className="admin-panel admin-list-panel">
          <div className="admin-panel-heading"><div><h2>Fila de anúncios</h2><p>Imóveis e vagas em análise pela equipe.</p></div></div>
          <div className="admin-filterbar compact-filters"><label className="admin-search-input"><span>⌕</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar anúncio ou anunciante" value={search} /></label><select aria-label="Filtrar oferta" onChange={(event) => onKind(event.target.value)} value={kind}><option>Tipo de oferta</option><option>Imóvel</option><option>Repasse</option></select><select aria-label="Ordenar anúncios"><option>Mais antigos primeiro</option><option>Mais recentes</option></select></div>
          {ads.map((ad) => <button className={`admin-ad-row${activeAd.id === ad.id ? ' active' : ''}`} key={ad.id} onClick={() => onSelect(ad.id)} type="button"><span className="admin-ad-illustration">⌂</span><span className="admin-ad-copy"><small>{ad.id} · {ad.kind}</small><strong>{ad.title}</strong><span>{ad.summary}</span><span>{ad.warning}</span><b>Revisar anúncio →</b></span><Badge tone={ad.state === 'Dados completos' ? 'green' : 'purple'}>{ad.state}</Badge></button>)}
          <div className="admin-table-footer"><span>Exibindo {ads.length} de 12 anúncios pendentes</span><button className="admin-row-link" type="button">Ver fila completa →</button></div>
          <p className="admin-illustration-note">Anúncios demonstrativos. A API atual não oferece rotas de moderação administrativa.</p>
        </section>
        <aside className="admin-panel admin-selected-panel">
          <span className="admin-panel-kicker">ANÚNCIO SELECIONADO</span><div className="admin-panel-heading"><h2>{activeAd.id}</h2><Badge>{activeAd.state}</Badge></div>
          <div className="admin-property-art"><span>⌂</span><div><small>MACEIÓ · FAROL</small><strong>{activeAd.title}</strong><small>{activeAd.detail}</small></div></div>
          <h3>{activeAd.owner}</h3><p className="admin-panel-subtitle">Proprietário · perfil verificado</p><hr />
          <h3>INFORMAÇÕES PARA CONFERIR</h3>
          <Evidence compact title="Caução declarada" detail="Confirmar valor e forma de depósito." />
          <Evidence compact pending title={activeAd.warning} detail="Solicitar condição prevista no contrato." />
          <Evidence compact title="Ocupação e modalidade declaradas" detail="Dados do anúncio completos." />
          <div className="admin-info-box purple-box">ⓘ Sinalização para revisão humana. Confira documentos antes de concluir.</div>
          <div className="admin-action-row"><button className="admin-outline-button" onClick={() => onAction('Ajuste solicitado')} type="button">Solicitar ajuste</button><button className="admin-primary-button" onClick={() => onAction('Revisão concluída')} type="button">Concluir revisão</button></div>
        </aside>
      </div>
    </>
  );
}

function RecommendationsPage({ items, active, onSelect, onAction, search, onSearch, status, onStatus }) {
  return (
    <>
      <Stats items={[
        { label: 'PERFIS BEM RECOMENDADOS', value: '286', badge: 'Selo demonstrativo', tone: 'green' },
        { label: 'RECOMENDAÇÕES RECEBIDAS', value: '1.042', note: 'na comunidade' },
        { label: 'AGUARDANDO CONFERÊNCIA', value: '5', badge: 'novas indicações' },
        { label: 'VÍNCULOS CONFIRMADOS', value: '914' },
      ]} />
      <div className="admin-review-layout">
        <section className="admin-panel admin-list-panel">
          <div className="admin-panel-heading"><div><h2>Recomendações recentes</h2><p>Confirme a relação de convivência antes de publicar.</p></div><button className="admin-row-link" type="button">Ver todas →</button></div>
          <div className="admin-filterbar"><label className="admin-search-input"><span>⌕</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar pessoa ou protocolo" value={search} /></label><select aria-label="Ordenar recomendações"><option>Recentes</option><option>Mais antigas</option></select><select aria-label="Filtrar status" onChange={(event) => onStatus(event.target.value)} value={status}><option>Status</option><option>Em conferência</option><option>Publicada</option><option>Conferir vínculo</option></select></div>
          {items.map((item) => <button className={`admin-recommendation-row${active.id === item.id ? ' active' : ''}`} key={item.id} onClick={() => onSelect(item.id)} type="button"><Avatar tone="pink">{item.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Avatar><span><small>{item.id} · CONVIVÊNCIA</small><strong>{item.author} recomendou {item.person}</strong><span>{item.status === 'Publicada' ? 'Vínculo confirmado · recebida ontem' : 'Moraram juntos · recebida há 2 h'}</span></span><Badge tone={item.status === 'Publicada' ? 'green' : 'purple'}>{item.status}</Badge></button>)}
          <div className="admin-table-footer"><span>Exibindo {items.length} de 42 recomendações recentes.</span></div>
          <p className="admin-illustration-note">Recomendações demonstrativas até a disponibilidade das rotas administrativas.</p>
        </section>
        <aside className="admin-panel admin-selected-panel">
          <span className="admin-panel-kicker">RECOMENDAÇÃO SELECIONADA</span><div className="admin-panel-heading"><h2>{active.id}</h2><Badge>{active.status}</Badge></div>
          <h3>PESSOA RECOMENDADA</h3><div className="admin-person-cell"><Avatar>{active.person.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Avatar><span><strong>{active.person}</strong><small>{active.profile}</small></span></div><Badge tone="green">✓ Bem recomendado</Badge><hr />
          <h3>QUEM RECOMENDOU</h3><p><strong>{active.author}</strong> · vínculo informado</p><div className="admin-recommendation-message"><strong>Mensagem de recomendação</strong><p>“{active.message}”</p></div>
          <Evidence compact title="Consentimento para exibição confirmado" detail="Sem notas numéricas ou estrelas." />
          <div className="admin-action-row"><button className="admin-outline-button" onClick={() => onAction('Ajuste solicitado')} type="button">Pedir ajuste</button><button className="admin-primary-button" onClick={() => onAction('Publicada')} type="button">Confirmar e publicar</button></div>
        </aside>
      </div>
    </>
  );
}

function VerificationsPage({ users, search, onSearch }) {
  const [stage, setStage] = useState('Etapa');
  const requests = users.filter((user) => (
    user.status !== 'Não se aplica' &&
    `${user.name} ${user.id} ${user.institution}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) &&
    (stage === 'Etapa' || user.status === stage)
  ));
  return (
    <>
      <Stats items={[
        { label: 'SOLICITAÇÕES ABERTAS', value: '18' },
        { label: 'E-MAIL PENDENTE', value: '7', badge: 'aguardando confirmação' },
        { label: 'REVISÃO ADMINISTRATIVA', value: '6', badge: 'em análise', tone: 'green' },
        { label: 'VÍNCULOS CONFIRMADOS NO MÊS', value: '142' },
      ]} />
      <div className="admin-review-layout">
        <section className="admin-panel admin-list-panel">
          <div className="admin-panel-heading"><div><h2>Fila de solicitações</h2><p>Acompanhe o status e abra o perfil em Usuários para analisar cada pedido.</p></div><Link className="admin-row-link" to="/admin/usuarios">Ver todas →</Link></div>
          <div className="admin-filterbar"><label className="admin-search-input"><span>⌕</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar pessoa ou protocolo" value={search} /></label><select aria-label="Instituição"><option>Instituição</option><option>UFAL</option><option>IFAL</option></select><select aria-label="Etapa" onChange={(event) => setStage(event.target.value)} value={stage}><option>Etapa</option><option>Em análise</option><option>Verificado</option></select></div>
          <div className="admin-table-scroll"><table><thead><tr><th>PESSOA</th><th>INSTITUIÇÃO</th><th>ETAPA</th><th>PEDIDO</th></tr></thead><tbody>
            {requests.slice(0, 4).map((user) => <tr key={user.id}><td><Link className="admin-person-cell" to={`/admin/usuarios/${user.id}`}><Avatar tone="pink">{user.initials}</Avatar><span><strong>{user.name}</strong><small>{user.email}</small></span></Link></td><td>{user.institution}</td><td><Badge tone={user.status === 'Verificado' ? 'green' : 'purple'}>{user.status}</Badge></td><td><Link className="admin-row-link" to={`/admin/usuarios/${user.id}`}>{user.id.toUpperCase()}</Link></td></tr>)}
          </tbody></table></div>
          {requests.length === 0 && <p className="admin-empty">Nenhuma solicitação encontrada.</p>}
          <div className="admin-table-footer"><span>Exibindo {Math.min(requests.length, 4)} de 18 solicitações abertas.</span></div>
          <p className="admin-illustration-note">A fila representa dados de exemplo e não é carregada da API.</p>
        </section>
        <aside className="admin-panel admin-flow-panel"><span className="admin-panel-kicker">FLUXO DA VERIFICAÇÃO</span><h2>Vínculo acadêmico</h2><p className="admin-panel-subtitle">Acompanhe as etapas até a análise individual.</p>
          <Evidence compact title="Instituição selecionada" detail="Domínio cadastrado para a instituição." />
          <Evidence compact title="E-mail institucional confirmado" detail="A confirmação é feita pela própria pessoa." />
          <Evidence compact pending title="Análise individual em Usuários" detail="A equipe confere o pedido no perfil." />
          <div className="admin-info-box"><strong>ⓘ A fila não substitui o perfil do usuário.</strong><p>Dados individuais, comprovantes e decisão ficam em Usuários → Analisar vínculo.</p></div>
          <Link className="admin-primary-button full" to="/admin/usuarios">Abrir Usuários</Link>
          <p className="admin-panel-subtitle">Selos só aparecem após a confirmação do vínculo.</p>
        </aside>
      </div>
    </>
  );
}

function RecordsPage({ onExport, search, onSearch }) {
  const filteredRecords = initialRecords.filter((record) => `${record.date} ${record.owner} ${record.action} ${record.area} ${record.reference}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  return (
    <>
      <Stats items={[
        { label: 'AÇÕES REGISTRADAS HOJE', value: '28' },
        { label: 'EVENTOS NO HISTÓRICO', value: '1.284' },
        { label: 'AÇÕES DA EQUIPE', value: '19' },
        { label: 'EVENTOS AUTOMÁTICOS', value: '9' },
      ]} />
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading"><div><h2>Histórico recente</h2><p>Cada registro inclui responsável, horário e referência relacionada.</p></div><button className="admin-row-link" onClick={onExport} type="button">Exportar histórico</button></div>
        <div className="admin-filterbar"><label className="admin-search-input"><span>⌕</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por pessoa, ação ou referência" value={search} /></label><select aria-label="Período"><option>Últimos 7 dias</option><option>Últimos 30 dias</option></select><select aria-label="Categoria"><option>Todas as categorias</option><option>Verificações</option><option>Anúncios</option></select><select aria-label="Responsável"><option>Responsável</option><option>Carla Mendes</option><option>Rafael Lima</option></select><button className="admin-outline-button" onClick={onExport} type="button">▣ Baixar CSV</button></div>
        <div className="admin-table-scroll"><table><thead><tr><th>DATA E HORA</th><th>RESPONSÁVEL</th><th>AÇÃO</th><th>ÁREA</th><th>REFERÊNCIA</th><th>RESULTADO</th></tr></thead><tbody>
          {filteredRecords.map((record) => <tr key={`${record.date}-${record.time}`}><td><strong>{record.date}</strong><small>{record.time}</small></td><td><div className="admin-person-cell"><Avatar>{record.initials}</Avatar>{record.owner}</div></td><td>{record.action}</td><td>{record.area}</td><td><a className="admin-row-link" href="#registro">{record.reference}</a></td><td><Badge tone={record.result === 'Aguardando' ? 'purple' : record.result === 'Automático' ? 'teal' : 'green'}>{record.result}</Badge></td></tr>)}
        </tbody></table></div>
        <div className="admin-table-footer"><span>Registros são somente leitura e mantêm o responsável e o horário da ação.</span><div>1–6 de 1.284 <button className="selected" type="button">1</button><button type="button">2</button></div></div>
        <p className="admin-illustration-note">Histórico demonstrativo; o backend ainda não expõe eventos administrativos.</p>
      </section>
    </>
  );
}

function SettingsPage({ settings, setSettings, onSave }) {
  function toggle(key) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="admin-settings-layout">
      <aside className="admin-panel admin-settings-nav"><h3>SEÇÕES</h3>{['Instituições', 'Recomendações', 'Equipe e acesso', 'Privacidade', 'Notificações'].map((section, index) => <button className={index === 1 ? 'active' : ''} key={section} onClick={() => document.getElementById(`settings-${index === 1 ? 'recommendations' : 'team'}`)?.scrollIntoView({ behavior: 'smooth' })} type="button"><span>{['○', '◷', '⊕', '⬡', '☷'][index]}</span>{section}</button>)}<p>As alterações realizadas aqui ficam registradas na seção <strong>Registros.</strong></p></aside>
      <div className="admin-settings-main">
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Instituições e domínios</h2><p>Domínios usados para confirmar o vínculo universitário.</p></div><button className="admin-outline-button" onClick={() => onSave()} type="button">＋ Adicionar</button></div><div className="admin-institution-row"><span>⌂</span><div><strong>Universidade Federal de Alagoas (UFAL)</strong><small>Domínio institucional: @ufal.br</small></div><Badge tone="green">● Ativa</Badge><button className="admin-row-link" onClick={() => onSave()} type="button">Editar</button></div><p className="admin-illustration-note">Instituições demonstrativas. A API ainda não permite gerenciar domínios.</p></section>
        <section className="admin-panel" id="settings-recommendations"><div className="admin-panel-heading"><div><h2>Recomendações de convivência</h2><p>Defina como as recomendações aparecem nos perfis.</p></div><Badge>Em edição</Badge></div>
          <SettingRow title="Exibir o selo “Bem recomendado” nos perfis" description="O selo é visual; não apresenta nota numérica nem estrelas." enabled={settings.badge} onToggle={() => toggle('badge')} />
          <SettingRow title="Critério para exibir o selo" description="Ainda não definido" button="Definir critério" onClick={() => onSave()} />
          <SettingRow title="Conferir vínculo de convivência antes de publicar" description="A confirmação pode ser revisada pela equipe." enabled={settings.review} onToggle={() => toggle('review')} />
          <SettingRow title="Exibir no perfil somente com consentimento" enabled={settings.consent} onToggle={() => toggle('consent')} />
        </section>
        <section className="admin-panel" id="settings-team"><div className="admin-panel-heading"><div><h2>Equipe e acesso</h2><p>Pessoas com acesso ao painel administrativo.</p></div></div><div className="admin-institution-row"><Avatar>CM</Avatar><div><strong>{getAdministratorSession()?.login}</strong><small>Administradora · acesso conforme permissões autenticadas</small></div><strong>2 administradores</strong><strong>4 moderadores</strong><button className="admin-outline-button" onClick={() => onSave()} type="button">Gerenciar</button></div><p className="admin-illustration-note">Gerenciamento de equipe não está disponível na API atual.</p></section>
        <div className="admin-settings-save"><button className="admin-primary-button" onClick={onSave} type="button">Salvar alterações</button></div>
      </div>
    </div>
  );
}

function SettingRow({ title, description, enabled, onToggle, button, onClick }) {
  return <div className="admin-setting-row"><div><strong>{title}</strong>{description && <small>{description}</small>}</div>{button ? <button className="admin-outline-button" onClick={onClick} type="button">{button}</button> : <button aria-checked={enabled} aria-label={title} className={`admin-toggle${enabled ? ' on' : ''}`} onClick={onToggle} role="switch" type="button"><span /></button>}</div>;
}
