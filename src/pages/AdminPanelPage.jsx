import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom';
import { getAdministratorSession, logoutAdministrator } from '../services/adminAuth.js';
import { getAdminListing, listAdminListings, moderateAdminListing } from '../services/adminListings.js';
import { changeAdminUserStatus, getAdminUser, listAdminUsers } from '../services/adminUsers.js';
import { Logo } from '../components/Logo.jsx';
import { AdminReportsPage } from './AdminReportsPage.jsx';
import './AdminPanelPage.css';

/* Navegação do protótipo preservada para referência.
const navigation = [
  { path: '/admin', label: 'Visão geral', icon: '⌂' },
  { path: '/admin/usuarios', label: 'Usuários', icon: '○' },
  { path: '/admin/anuncios', label: 'Anúncios', icon: '□' },
  { path: '/admin/denuncias', label: 'Denúncias', icon: '⚑' },
  { path: '/admin/recomendacoes', label: 'Recomendações', icon: '◷' },
  { path: '/admin/verificacoes', label: 'Verificações', icon: '☑' },
  { path: '/admin/registros', label: 'Registros', icon: '☷' },
  { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
];
*/
const navigation = [
  { path: '/admin/usuarios', label: 'Usuários', icon: '○' },
  { path: '/admin/anuncios', label: 'Anúncios', icon: '□' },
  { path: '/admin/denuncias', label: 'Denúncias', icon: '⚑' },
];

/* Exemplo visual ocultado; mantido para referência.
const demoVerificationUsers = [
  { id: 'vnk-1038', name: 'Bianca Martins', email: 'bianca.m@ufal.br', profile: 'Aluna buscadora', institution: 'UFAL', status: 'Em análise', date: '12 nov 2026', initials: 'BM' },
  { id: 'vnk-1029', name: 'Lucas Nascimento', email: 'lucas.n@ufal.br', profile: 'Aluno-anfitrião', institution: 'UFAL', status: 'Verificado', date: '11 nov 2026', initials: 'LN' },
  { id: 'vnk-1036', name: 'João Pedro Reis', email: 'joao.p@aluno.ifal.edu.br', profile: 'Aluno-organizador', institution: 'IFAL', status: 'Em análise', date: '10 nov 2026', initials: 'JR' },
  { id: 'usr-0541', name: 'Mariana Costa', email: 'mariana.costa@email.com', profile: 'Ofertante de imóvel', institution: '—', status: 'Não se aplica', date: '09 nov 2026', initials: 'MC' },
  { id: 'vnk-1032', name: 'Ana Martins', email: 'ana.m@ufal.br', profile: 'Aluna buscadora', institution: 'UFAL', status: 'Em análise', date: '08 nov 2026', initials: 'AM' },
  { id: 'vnk-1024', name: 'Caio Ribeiro', email: 'caio.r@ufal.br', profile: 'Aluno-anfitrião', institution: 'UFAL', status: 'Verificado', date: '07 nov 2026', initials: 'CR' },
];
*/
const demoVerificationUsers = [];

/* Exemplo visual ocultado; mantido para referência.
const initialRecommendations = [
  { id: 'REC-0185', person: 'Pedro Souza', author: 'Marina Alves', profile: 'Aluno-anfitrião · UFAL', status: 'Em conferência', message: 'Pedro cuida dos espaços comuns e mantém uma comunicação clara durante a nossa convivência.' },
  { id: 'REC-0182', person: 'Lucas Nascimento', author: 'Ana Clara', profile: 'Aluno-anfitrião · UFAL', status: 'Publicada', message: 'Uma convivência muito boa e responsável.' },
  { id: 'REC-0179', person: 'Mariana Costa', author: 'Luiza Barbosa', profile: 'Ofertante de imóvel', status: 'Conferir vínculo', message: 'Moramos juntas e tivemos uma boa experiência.' },
  { id: 'REC-0175', person: 'João Nascimento', author: 'Caio Ribeiro', profile: 'Aluno-organizador · IFAL', status: 'Publicada', message: 'Organizado, atencioso e respeitoso com a casa.' },
];
*/
const initialRecommendations = [];

/* Exemplo visual ocultado; mantido para referência.
const initialRecords = [
  { date: '13 nov 2026', time: '10:24', owner: 'Carla Mendes', initials: 'CM', action: 'Vínculo universitário aprovado', area: 'Verificações', reference: 'VNK-1038', result: 'Concluído' },
  { date: '13 nov 2026', time: '10:11', owner: 'Rafael Lima', initials: 'RL', action: 'Recomendação confirmada', area: 'Recomendações', reference: 'REC-0185', result: 'Concluído' },
  { date: '13 nov 2026', time: '09:58', owner: 'Sistema Moraê', initials: '+', action: 'E-mail institucional confirmado', area: 'Usuários', reference: 'VNK-1044', result: 'Automático' },
  { date: '12 nov 2026', time: '17:48', owner: 'Carla Mendes', initials: 'CM', action: 'Ajuste solicitado ao anunciante', area: 'Anúncios', reference: 'IMO-0318', result: 'Aguardando' },
  { date: '12 nov 2026', time: '16:10', owner: 'Rafael Lima', initials: 'RL', action: 'Consentimento de exibição confirmado', area: 'Recomendações', reference: 'REC-0182', result: 'Concluído' },
  { date: '12 nov 2026', time: '15:42', owner: 'Rafael Lima', initials: 'RL', action: 'Domínio institucional atualizado', area: 'Verificações', reference: 'UFAL', result: 'Concluído' },
];
*/
const initialRecords = [];

const pageInfo = {
  '': ['Visão geral', 'Acompanhe as revisões e mantenha a comunidade Moraê segura.'],
  usuarios: ['Usuários e vínculos', 'Confira o vínculo acadêmico e acompanhe as contas cadastradas.'],
  anuncios: ['Anúncios cadastrados', 'Aprove ou rejeite os imóveis e vagas enviados à plataforma.'],
  denuncias: ['Denúncias', 'Analise ocorrências reportadas pela comunidade e registre o encaminhamento.'],
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
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersRefresh, setUsersRefresh] = useState(0);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState('');
  const [userStatusSaving, setUserStatusSaving] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [ads, setAds] = useState([]);
  const [adsTotal, setAdsTotal] = useState(0);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState('');
  const [adsRefresh, setAdsRefresh] = useState(0);
  const [reportsRefresh, setReportsRefresh] = useState(0);
  const [adPage, setAdPage] = useState(1);
  const [adDetail, setAdDetail] = useState(null);
  const [adDetailLoading, setAdDetailLoading] = useState(false);
  const [adDetailError, setAdDetailError] = useState('');
  const [adModerating, setAdModerating] = useState(false);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAd, setSelectedAd] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(initialRecommendations[0]?.id ?? '');
  const [userStatus, setUserStatus] = useState('Todos');
  const [adStatus, setAdStatus] = useState('');
  const [recommendationStatus, setRecommendationStatus] = useState('Status');
  const [settings, setSettings] = useState({ badge: true, review: true, consent: true });

  const [pageKey, userId] = path.split('/');
  const title = pageKey === 'usuarios' && userId ? 'Detalhes do usuário' : (pageInfo[pageKey] || pageInfo[''])[0];
  const subtitle = pageInfo[pageKey]?.[1] || pageInfo[''][1];
  const searchValue = search.trim().toLocaleLowerCase('pt-BR');
  const activeAd = adDetail;
  const filteredRecommendations = recommendations.filter((item) => (
    `${item.id} ${item.person} ${item.author}`.toLocaleLowerCase('pt-BR').includes(searchValue) &&
    (recommendationStatus === 'Status' || item.status === recommendationStatus)
  ));
  const activeRecommendation = recommendations.find((item) => item.id === selectedRecommendation) || null;
  const reviewerName = session?.login.replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('pt-BR')) || '';
  const initials = reviewerName.split(' ').map((part) => part[0]).slice(0, 2).join('');

  useEffect(() => {
    if (!session || pageKey !== 'usuarios' || userId) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setUsersLoading(true);
      setUsersError('');
      listAdminUsers({
        search,
        status: userStatus,
        page: userPage,
        limit: 25,
        signal: controller.signal,
      }).then((result) => {
        const adminUserId = session.userId.trim().toLocaleLowerCase('pt-BR');
        const visibleUsers = result.items.filter((user) => (
          String(user.id).trim().toLocaleLowerCase('pt-BR') !== adminUserId
        ));
        const excludedCount = result.items.length - visibleUsers.length;
        setUsers(visibleUsers);
        setTotalUsers(Math.max(0, result.total - excludedCount));
      }).catch((error) => {
        if (error.name !== 'AbortError') setUsersError(error.message);
      }).finally(() => {
        if (!controller.signal.aborted) setUsersLoading(false);
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [pageKey, userId, search, userStatus, userPage, usersRefresh]);

  useEffect(() => {
    if (!session || pageKey !== 'usuarios' || !userId) return undefined;

    const controller = new AbortController();
    setUserDetail(null);
    setUserDetailLoading(true);
    setUserDetailError('');
    getAdminUser(userId, { signal: controller.signal }).then(setUserDetail).catch((error) => {
      if (error.name !== 'AbortError') setUserDetailError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setUserDetailLoading(false);
    });

    return () => controller.abort();
  }, [pageKey, userId]);

  useEffect(() => {
    if (!session || pageKey !== 'anuncios') return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setAdsLoading(true);
      setAdsError('');
      listAdminListings({
        search,
        status: adStatus,
        page: adPage,
        limit: 25,
        signal: controller.signal,
      }).then((result) => {
        setAds(result.items);
        setAdsTotal(result.total);
        setSelectedAd((current) => (
          result.items.some((listing) => listing.listingId === current)
            ? current
            : result.items[0]?.listingId || ''
        ));
      }).catch((error) => {
        if (error.name !== 'AbortError') setAdsError(error.message);
      }).finally(() => {
        if (!controller.signal.aborted) setAdsLoading(false);
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [pageKey, search, adStatus, adPage, adsRefresh]);

  useEffect(() => {
    if (!session || pageKey !== 'anuncios' || !selectedAd) {
      setAdDetail(null);
      return undefined;
    }

    const controller = new AbortController();
    setAdDetail(null);
    setAdDetailLoading(true);
    setAdDetailError('');
    getAdminListing(selectedAd, { signal: controller.signal }).then(setAdDetail).catch((error) => {
      if (error.name !== 'AbortError') setAdDetailError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setAdDetailLoading(false);
    });

    return () => controller.abort();
  }, [pageKey, selectedAd]);

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4500);
  }

  async function updateUserStatus(status) {
    if (!userDetail) return;
    if (status === 'DEACTIVATED' && !window.confirm('Desativar esta conta permanentemente?')) return;

    setUserStatusSaving(true);
    try {
      const updatedUser = await changeAdminUserStatus(userDetail.id, status);
      setUserDetail(updatedUser);
      setUsers((current) => current.map((user) => (
        user.id === updatedUser.id ? updatedUser : user
      )));
      setUsersRefresh((current) => current + 1);
      showNotice(`A conta de ${updatedUser.name} foi atualizada.`);
    } catch (error) {
      showNotice(error.message || 'Não foi possível atualizar a conta.');
    } finally {
      setUserStatusSaving(false);
    }
  }

  async function moderateAd(status) {
    if (!adDetail || adModerating) return;
    if (status === 'REJECTED' && !window.confirm(`Rejeitar o anúncio "${adDetail.title}"? Ele não aparecerá na busca.`)) return;

    setAdModerating(true);
    try {
      const updated = await moderateAdminListing(adDetail.listingId, status);
      setAdDetail(updated);
      setAds((current) => current.map((ad) => (
        ad.listingId === updated.listingId ? { ...ad, status: updated.status } : ad
      )));
      showNotice(status === 'APPROVED'
        ? `Anúncio "${updated.title}" aprovado: ele já aparece na busca.`
        : `Anúncio "${updated.title}" rejeitado.`);
    } catch (error) {
      showNotice(error.message || 'Não foi possível moderar o anúncio.');
    } finally {
      setAdModerating(false);
    }
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
          {navigation.filter((item) => item.path !== '/admin/configuracoes').map((item) => (
            <NavLink
              end={item.path === '/admin'}
              key={item.path}
              onClick={() => { setSearch(''); setUserPage(1); }}
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
          <div className="admin-trust-card"><strong><span>✓</span>{pageKey === 'usuarios' ? ' Contas protegidas' : pageKey === 'denuncias' ? ' Moderação protegida' : ' Protótipo de equipe'}</strong><p>{pageKey === 'usuarios' ? 'Alterações de contas exigem permissão administrativa.' : pageKey === 'denuncias' ? 'Acesso às denúncias exige a permissão VIEW_REPORTS.' : 'As revisões demonstradas não são persistidas pela API.'}</p></div>
          <div className="admin-sidebar-user"><Avatar>{initials}</Avatar><span><strong>{reviewerName}</strong><small>Administradora</small></span></div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-crumb"><Link to="/admin">Moraê</Link><span>›</span><strong>{title}</strong></div>
          <label className="admin-global-search"><span>⌕</span><input aria-label="Buscar no painel" onChange={(event) => { setSearch(event.target.value); setUserPage(1); setAdPage(1); }} placeholder="Buscar no painel" value={search} /></label>
          <button className="admin-notification" onClick={() => showNotice('Você está em dia com as notificações do painel.')} title="Notificações" type="button">♧</button>
          <div className="admin-top-user"><Avatar>{initials}</Avatar><span><strong>{reviewerName}</strong><small>Administradora</small></span></div>
          <button className="admin-logout" onClick={() => { logoutAdministrator(); window.location.assign('/login'); }} type="button">Sair</button>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div><h1>{title}</h1><p>{subtitle}</p></div>
            {pageKey === '' && <button className="admin-primary-button" onClick={() => showNotice('O backend ainda não oferece uma operação para criar comunicados.')} type="button">＋ Novo comunicado</button>}
            {pageKey === 'anuncios' && <button className="admin-outline-button" onClick={() => setAdsRefresh((current) => current + 1)} type="button">Atualizar lista</button>}
            {pageKey === 'denuncias' && <button className="admin-outline-button" onClick={() => setReportsRefresh((current) => current + 1)} type="button">Atualizar lista</button>}
            {pageKey === 'usuarios' && userId && <Link className="admin-outline-button" to="/admin/usuarios">‹ Voltar à lista</Link>}
          </div>

          {pageKey === 'usuarios'
            ? <div className="admin-prototype-banner" role="note"><strong>Gerenciamento de contas:</strong> os dados e alterações desta seção são consultados e salvos no banco de dados.</div>
            : pageKey === 'anuncios'
              ? <div className="admin-prototype-banner" role="note"><strong>Anúncios:</strong> anúncios novos ficam pendentes até serem aprovados aqui; só os aprovados aparecem na busca.</div>
            : pageKey === 'denuncias'
              ? <div className="admin-prototype-banner" role="note"><strong>Moderação:</strong> denúncias e atualizações são persistidas; anotações ficam visíveis apenas à equipe autorizada.</div>
            : null}

          {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} type="button" aria-label="Fechar aviso">×</button></div>}

          {pageKey === '' && <p className="admin-empty">O resumo administrativo ainda não possui dados integrados.</p>}
          {pageKey === 'usuarios' && !userId && (
            <UsersPage
              users={users}
              total={totalUsers}
              loading={usersLoading}
              error={usersError}
              status={userStatus}
              onStatus={(value) => { setUserStatus(value); setUserPage(1); }}
              search={search}
              onSearch={(value) => { setSearch(value); setUserPage(1); }}
              page={userPage}
              onPage={setUserPage}
            />
          )}
          {pageKey === 'usuarios' && userId && (
            <UserReviewPage
              user={userDetail}
              loading={userDetailLoading}
              error={userDetailError}
              saving={userStatusSaving}
              onStatus={updateUserStatus}
            />
          )}
          {pageKey === 'anuncios' && (
            <AdsPage
              ads={ads}
              total={adsTotal}
              loading={adsLoading}
              error={adsError}
              onRetry={() => setAdsRefresh((current) => current + 1)}
              page={adPage}
              onPage={setAdPage}
              status={adStatus}
              onStatus={(value) => { setAdStatus(value); setAdPage(1); }}
              activeAd={activeAd}
              detailLoading={adDetailLoading}
              detailError={adDetailError}
              onSelect={setSelectedAd}
              moderating={adModerating}
              onModerate={moderateAd}
              search={search}
              onSearch={(value) => { setSearch(value); setAdPage(1); }}
            />
          )}
          {pageKey === 'denuncias' && (
            <AdminReportsPage
              search={search}
              refresh={reportsRefresh}
              onNotice={showNotice}
            />
          )}
          {pageKey === 'recomendacoes' && <p className="admin-empty">Esta área ainda não possui dados integrados.</p>}
          {pageKey === 'verificacoes' && <p className="admin-empty">Esta área ainda não possui dados integrados.</p>}
          {pageKey === 'registros' && <p className="admin-empty">Esta área ainda não possui dados integrados.</p>}
          {pageKey === 'configuracoes' && <p className="admin-empty">Esta área ainda não possui dados integrados.</p>}
          {!['', 'usuarios', 'anuncios', 'denuncias', 'recomendacoes', 'verificacoes', 'registros', 'configuracoes'].includes(pageKey) && (
            <p className="admin-empty">Esta área ainda não possui dados integrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* Protótipo ocultado; mantido para referência.
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

*/

function ActivityItem({ title, detail, time }) {
  return <div className="admin-activity-item"><span /><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div>;
}

function AttentionItem({ color, title, count }) {
  return <div className="admin-attention-item"><i className={color} /><span>{title}</span><strong>{count}</strong></div>;
}

function UsersPage({ users, total, loading, error, status, onStatus, search, onSearch, page, onPage }) {
  const pageCount = Math.max(1, Math.ceil(total / 25));
  return (
    <>
      <Stats items={[
        { label: 'USUÁRIOS CADASTRADOS', value: total.toLocaleString('pt-BR'), note: 'total no banco de dados' },
      ]} />
      <section className="admin-panel admin-table-panel">
        <div className="admin-filterbar">
          <label className="admin-search-input"><span>⌕</span><span className="sr-only">Buscar pessoa</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" value={search} /></label>
          <select aria-label="Filtrar situação da conta" onChange={(event) => onStatus(event.target.value)} value={status}><option>Todos</option><option value="ACTIVE">Ativa</option><option value="SUSPENDED">Suspensa</option><option value="DEACTIVATED">Desativada</option></select>
          <button className="admin-outline-button" onClick={() => window.print()} type="button">▣ Exportar lista</button>
        </div>
        {error && <p className="admin-empty" role="alert">{error}</p>}
        {loading && <p className="admin-empty" role="status">Consultando usuários cadastrados...</p>}
        {!loading && !error && <div className="admin-table-scroll"><table><thead><tr><th>PESSOA</th><th>PERFIL</th><th>CURSO</th><th>SITUAÇÃO DA CONTA</th><th>CADASTRO</th><th /></tr></thead>
          <tbody>{users.map((user) => {
            const profile = user.student && user.propertyOwner
              ? 'Estudante · Ofertante'
              : user.student ? 'Estudante' : user.propertyOwner ? 'Ofertante de imóvel' : 'Usuário';
            const accountStatus = accountStatusLabel(user.status);
            return <tr key={user.id}><td><div className="admin-person-cell"><Avatar tone="pink">{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR')}</Avatar><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{profile}</td><td>{user.student?.course || '—'}</td><td><Badge tone={user.status === 'ACTIVE' ? 'green' : user.status === 'DEACTIVATED' ? 'neutral' : 'purple'}>{accountStatus}</Badge></td><td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td><td><Link className="admin-row-link" to={`/admin/usuarios/${user.id}`}>Gerenciar →</Link></td></tr>;
          })}</tbody>
        </table></div>}
        {!loading && !error && users.length === 0 && <p className="admin-empty">Nenhum usuário corresponde à consulta.</p>}
        <div className="admin-table-footer"><span>Exibindo {users.length} de {total.toLocaleString('pt-BR')} usuários</span><div><button className="admin-outline-button" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)} type="button">Anterior</button><span>Página {page} de {pageCount}</span><button className="admin-outline-button" disabled={page >= pageCount || loading} onClick={() => onPage(page + 1)} type="button">Próxima</button></div></div>
      </section>
    </>
  );
}

function accountStatusLabel(status) {
  return {
    ACTIVE: 'Ativa',
    SUSPENDED: 'Suspensa',
    DEACTIVATED: 'Desativada',
  }[status] || status;
}

function verificationStatusLabel(status) {
  return {
    PENDING: 'Em análise',
    VERIFIED: 'Verificado',
    REJECTED: 'Reprovado',
  }[status] || 'Não se aplica';
}

function UserReviewPage({ user, loading, error, saving, onStatus }) {
  if (loading) return <p className="admin-empty" role="status">Carregando dados do usuário...</p>;
  if (error) return <p className="admin-empty" role="alert">{error}</p>;
  if (!user) return <p className="admin-empty" role="alert">Usuário não encontrado.</p>;

  const canBeManaged = user.status !== 'DEACTIVATED';
  return (
    <div className="admin-review-layout">
      <div className="admin-review-main">
        <section className="admin-panel admin-request-card">
          <div className="admin-request-person"><Avatar tone="pink">{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR')}</Avatar><div><small>ID {user.id}</small><h2>{user.name}</h2><p>{user.email}</p></div><Badge tone={user.status === 'ACTIVE' ? 'green' : user.status === 'DEACTIVATED' ? 'neutral' : 'purple'}>{accountStatusLabel(user.status)}</Badge></div>
          <div className="admin-request-meta"><span>Telefone <strong>{user.phone || 'Não informado'}</strong></span><span>E-mail confirmado <strong>{user.emailVerified ? 'Sim' : 'Não'}</strong></span><span>Cadastro <strong>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</strong></span></div>
        </section>
        <section className="admin-panel">
          <h2>Perfis vinculados</h2>
          {user.student && <Evidence title={`Estudante · ${user.student.course}`} detail={`Período ${user.student.period}`} status={verificationStatusLabel(user.student.verificationStatus)} />}
          {user.propertyOwner && <Evidence title="Ofertante de imóvel" detail="Perfil de proprietário cadastrado" status={verificationStatusLabel(user.propertyOwner.verificationStatus)} />}
          {!user.student && !user.propertyOwner && <p className="admin-panel-subtitle">Nenhum perfil complementar cadastrado.</p>}
        </section>
      </div>
      <aside className="admin-panel admin-decision-panel">
        <h2>Gerenciar conta</h2><p className="admin-panel-subtitle">As alterações são persistidas e afetam o acesso do usuário.</p>
        {user.status === 'ACTIVE' && <button className="admin-outline-button full" disabled={saving} onClick={() => onStatus('SUSPENDED')} type="button">Suspender conta</button>}
        {user.status === 'SUSPENDED' && <button className="admin-primary-button full" disabled={saving} onClick={() => onStatus('ACTIVE')} type="button">Reativar conta</button>}
        {canBeManaged && <button className="admin-outline-button full" disabled={saving} onClick={() => onStatus('DEACTIVATED')} type="button">Desativar conta permanentemente</button>}
        {!canBeManaged && <div className="admin-info-box"><strong>Conta desativada</strong><p>A desativação é definitiva e não pode ser revertida por este painel.</p></div>}
        {saving && <p className="admin-panel-subtitle" role="status">Salvando alteração...</p>}
        <div className="admin-info-box"><strong>ⓘ Gerenciamento administrativo</strong><p>O acesso é protegido por token e permissão MANAGE_USERS.</p></div>
      </aside>
    </div>
  );
}

function Evidence({ title, detail, status, compact = false, pending = false }) {
  return <div className={`admin-evidence${compact ? ' compact' : ''}`}><span className={pending ? 'pending' : ''}>{pending ? '!' : '✓'}</span><div><strong>{title}</strong><small>{detail}</small></div>{status && <Badge tone="green">{status}</Badge>}</div>;
}

function AdsPage({
  ads,
  total,
  loading,
  error,
  onRetry,
  page,
  onPage,
  status,
  onStatus,
  activeAd,
  detailLoading,
  detailError,
  onSelect,
  moderating,
  onModerate,
  search,
  onSearch,
}) {
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="admin-review-layout ads-layout">
      <section className="admin-panel admin-list-panel">
        <div className="admin-panel-heading"><div><h2>Anúncios cadastrados</h2><p>Imóveis e vagas consultados no sistema.</p></div></div>
        <div className="admin-filterbar compact-filters">
          <label className="admin-search-input"><span>⌕</span><input onChange={(event) => onSearch(event.target.value)} placeholder="Buscar anúncio, anunciante ou cidade" value={search} /></label>
          <select aria-label="Filtrar situação do anúncio" onChange={(event) => onStatus(event.target.value)} value={status}>
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_REVIEW">Em análise</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="ARCHIVED">Arquivado</option>
            <option value="REMOVED">Removido</option>
          </select>
        </div>
        {loading && <p className="admin-empty" role="status">Carregando anúncios...</p>}
        {!loading && error && <div className="admin-api-error" role="alert"><span>{error}</span><button className="admin-outline-button" onClick={onRetry} type="button">Tentar novamente</button></div>}
        {!loading && !error && ads.length === 0 && <p className="admin-empty">Nenhum anúncio encontrado com esses filtros.</p>}
        {!loading && !error && ads.map((ad) => {
          const firstImage = ad.media?.[0];
          return (
            <button
              aria-pressed={activeAd?.listingId === ad.listingId}
              className={`admin-ad-row${activeAd?.listingId === ad.listingId ? ' active' : ''}`}
              key={ad.listingId}
              onClick={() => onSelect(ad.listingId)}
              type="button"
            >
              {firstImage
                ? <img alt="" className="admin-ad-illustration admin-ad-image" src={resolveAdminMediaUrl(firstImage.url)} />
                : <span className="admin-ad-illustration">⌂</span>}
              <span className="admin-ad-copy">
                <small>{ad.listingId} · {housingTypeLabel(ad.property.housingType)}</small>
                <strong>{ad.title}</strong>
                <span>{ad.property.residence.city} · {ad.property.residence.neighborhood}</span>
                <span>{ad.property.owner.name} · {formatCurrency(ad.rent)}/mês</span>
              </span>
              <Badge tone={listingStatusTone(ad.status)}>{listingStatusLabel(ad.status)}</Badge>
            </button>
          );
        })}
        {!loading && !error && total > 0 && (
          <div className="admin-table-footer">
            <span>Exibindo {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} de {total} anúncios</span>
            <div>
              <button aria-label="Página anterior" disabled={page <= 1} onClick={() => onPage(page - 1)} type="button">‹</button>
              <span>Página {page} de {pageCount}</span>
              <button aria-label="Próxima página" disabled={page >= pageCount} onClick={() => onPage(page + 1)} type="button">›</button>
            </div>
          </div>
        )}
      </section>
      <aside className="admin-panel admin-selected-panel">
        <span className="admin-panel-kicker">DETALHES DO ANÚNCIO</span>
        {detailLoading && <p className="admin-empty" role="status">Carregando detalhes...</p>}
        {!detailLoading && detailError && <div className="admin-api-error" role="alert">{detailError}</div>}
        {!detailLoading && !detailError && !activeAd && <p className="admin-empty">Selecione um anúncio para consultar os detalhes.</p>}
        {!detailLoading && !detailError && activeAd && (
          <>
            <div className="admin-panel-heading"><h2>{activeAd.title}</h2><Badge tone={listingStatusTone(activeAd.status)}>{listingStatusLabel(activeAd.status)}</Badge></div>
            <p className="admin-panel-subtitle">ID: {activeAd.listingId}</p>
            <ListingModeration listing={activeAd} moderating={moderating} onModerate={onModerate} />
            {activeAd.media?.length > 0 && (
              <div className="admin-listing-gallery">
                {activeAd.media.map((image) => (
                  <img alt={`Foto do anúncio ${activeAd.title}`} key={image.id} src={resolveAdminMediaUrl(image.url)} />
                ))}
              </div>
            )}
            <div className="admin-listing-detail">
              <h3>IMÓVEL E LOCALIZAÇÃO</h3>
              <p>{housingTypeLabel(activeAd.property.housingType)} · {activeAd.property.bedrooms} quartos · {activeAd.property.bathrooms} banheiros · {activeAd.property.parkingSpaces} vagas</p>
              <p>{activeAd.property.residence.street}, {activeAd.property.residence.number}{activeAd.property.residence.complement ? `, ${activeAd.property.residence.complement}` : ''}</p>
              <p>{activeAd.property.residence.neighborhood}, {activeAd.property.residence.city} - {activeAd.property.residence.state} · CEP {activeAd.property.residence.postalCode}</p>
              <h3>VALORES E CONDIÇÕES</h3>
              <p>Aluguel: {formatCurrency(activeAd.rent)}{activeAd.condominium !== null ? ` · Condomínio: ${formatCurrency(activeAd.condominium)}` : ''}</p>
              <p>{contractTypeLabel(activeAd.contractType)} · permanência mínima: {minimumStayLabel(activeAd.minimumStay)}</p>
              {activeAd.property.amenities?.length > 0 && <p>Comodidades: {activeAd.property.amenities.join(', ')}</p>}
              <h3>DESCRIÇÃO</h3>
              <p>{activeAd.description}</p>
              {activeAd.rules && <><h3>REGRAS</h3><p>{activeAd.rules}</p></>}
              <h3>ANUNCIANTE</h3>
              <p>{activeAd.property.owner.name} · {activeAd.property.owner.email}{activeAd.property.owner.phone ? ` · ${activeAd.property.owner.phone}` : ''}</p>
              <p>Cadastrado em {new Date(activeAd.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveAdminMediaUrl(url) {
  return new URL(url, API_BASE_URL).href;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function housingTypeLabel(value) {
  return ({ APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Quarto', REPUBLIC: 'República' })[value] || value;
}

function contractTypeLabel(value) {
  return ({ MONTHLY_RENTAL: 'Aluguel mensal', PROPERTY_SHARING: 'Compartilhamento', SEASONAL: 'Temporada' })[value] || value;
}

function minimumStayLabel(value) {
  return ({ NO_MINIMUM: 'Sem permanência mínima', THREE_MONTHS: '3 meses', SIX_MONTHS: '6 meses', TWELVE_MONTHS: '12 meses' })[value] || value;
}

function ListingModeration({ listing, moderating, onModerate }) {
  const awaitingReview = listing.status === 'PENDING' || listing.status === 'IN_REVIEW';
  const message = {
    PENDING: 'Aguardando moderação: o anúncio só aparece na busca depois de aprovado.',
    IN_REVIEW: 'Em análise: o anúncio só aparece na busca depois de aprovado.',
    APPROVED: 'Publicado na busca. Para retirá-lo do ar, use a área de Denúncias.',
    REJECTED: 'Rejeitado: fora da busca. Você pode reavaliar e aprovar.',
    ARCHIVED: 'Arquivado pelo anunciante.',
    REMOVED: 'Removido após denúncia.',
  }[listing.status];

  return (
    <div className="admin-listing-moderation">
      {message && <p>{message}</p>}
      {(awaitingReview || listing.status === 'REJECTED') && (
        <div className="admin-listing-moderation-actions">
          <button className="admin-primary-button" disabled={moderating} onClick={() => onModerate('APPROVED')} type="button">Aprovar anúncio</button>
          {awaitingReview && <button className="admin-outline-button" disabled={moderating} onClick={() => onModerate('REJECTED')} type="button">Rejeitar anúncio</button>}
        </div>
      )}
      {moderating && <p role="status">Salvando decisão...</p>}
    </div>
  );
}

function listingStatusLabel(value) {
  return ({ PENDING: 'Pendente', IN_REVIEW: 'Em análise', APPROVED: 'Aprovado', REJECTED: 'Rejeitado', ARCHIVED: 'Arquivado', REMOVED: 'Removido' })[value] || value;
}

function listingStatusTone(value) {
  return ({ APPROVED: 'green', REJECTED: 'pink', PENDING: 'purple', IN_REVIEW: 'teal' })[value] || 'neutral';
}

/* Protótipo ocultado; mantido para referência.
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

*/

/* Protótipo ocultado; mantido para referência.
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

*/

/* Protótipo ocultado; mantido para referência.
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

*/

/* Protótipo ocultado; mantido para referência.
function SettingsPage({ settings, setSettings, onSave }) {
  function toggle(key) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="admin-settings-layout">
      <aside className="admin-panel admin-settings-nav"><h3>SEÇÕES</h3>{['Instituições', 'Recomendações', 'Equipe e acesso', 'Privacidade', 'Notificações'].map((section, index) => <button className={index === 1 ? 'active' : ''} key={section} onClick={() => document.getElementById(`settings-${index === 1 ? 'recommendations' : 'team'}`)?.scrollIntoView({ behavior: 'smooth' })} type="button"><span>{['○', '◷', '⊕', '⬡', '☷'][index]}</span>{section}</button>)}<p>Este protótipo não salva alterações na API.</p></aside>
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

*/

function SettingRow({ title, description, enabled, onToggle, button, onClick }) {
  return <div className="admin-setting-row"><div><strong>{title}</strong>{description && <small>{description}</small>}</div>{button ? <button className="admin-outline-button" onClick={onClick} type="button">{button}</button> : <button aria-checked={enabled} aria-label={title} className={`admin-toggle${enabled ? ' on' : ''}`} onClick={onToggle} role="switch" type="button"><span /></button>}</div>;
}
