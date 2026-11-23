import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { AccountMenu } from '../components/AccountMenu.jsx';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LineIcon } from '../components/LineIcon.jsx';
import { ReportDialog } from '../components/ReportDialog.jsx';
import { calculateCompatibility, getAccessToken, getUserById, getUserReviews } from '../services/api.js';
import { getDemoUser } from '../utils/demoUser.js';
import './UserProfilePage.css';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const profiles = {
  'ana-beatriz': {
    name: 'Ana Beatriz', initials: 'AB', course: 'Arquitetura e Urbanismo', period: '3º período', tags: ['3º período', 'Arquitetura e Urbanismo', 'Moradia Estudantil'],
    about: 'Oi! Sou a Ana Beatriz, estudante de Arquitetura e Urbanismo. Sou uma pessoa organizada, tranquila e respeito muito o espaço e a rotina dos outros. Gosto de ambientes limpos, acolhedores e com boa convivência. Estou em busca de uma moradia próxima ao campus, com fácil acesso ao transporte e em um ambiente calmo para conciliar os estudos e a rotina.',
    housing: 'República ou apartamento compartilhado', distance: 'Até 5 km do Campus A. C. Simões', amenities: 'Wi-Fi, mobiliado e cozinha compartilhada', budget: 'Até R$ 800,00', organization: 'Organizada', environment: 'Ambiente tranquilo', smoking: 'Não fumante', guests: 'Recebe visitas às vezes',
    reviews: [{ title: 'Avaliação de locador', date: '12 mar. 2025', stars: 5, text: 'A Ana foi uma excelente inquilina! Sempre cumpriu os acordos, manteve o espaço organizado e foi muito respeitosa. Recomendo muito.' }, { title: 'Avaliação de morador', date: '03 fev. 2025', stars: 5, text: 'Foi muito bom dividir o espaço com a Ana. Tranquila, comunicativa e sempre disposta a ajudar.' }],
  },
  'carolina-lima': {
    name: 'Carolina Lima', initials: 'CL', course: 'Ciência da Computação', period: '5º período', tags: ['5º período', 'Ciência da Computação', 'Moradia Estudantil'],
    about: 'Oi! Me chamo Carolina, sou estudante de Ciência da Computação. Sou uma pessoa tranquila, organizada e gosto de ambientes agradáveis e respeitosos. Valorizo uma boa convivência e estou em busca de uma moradia próxima ao campus, onde eu possa estudar com calma e me sentir em casa.',
    housing: 'Apartamento compartilhado', distance: 'Até 5 km do Campus A. C. Simões', amenities: 'Wi-Fi e cozinha compartilhada', budget: 'Até R$ 600,00', organization: 'Organizada', environment: 'Ambiente tranquilo', smoking: 'Não fumante', guests: 'Prefere poucas visitas',
    reviews: [],
  },
};

function profileFromUser(user) {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('pt-BR');

  return {
    name: user.name,
    initials,
    photoUrl: user.photoUrl,
    role: 'Usuário',
    tags: [],
    about: 'Este usuário ainda não adicionou uma apresentação ao perfil.',
    course: 'Não informado',
    period: 'Não informado',
    housing: 'Não informado',
    distance: 'Não informado',
    amenities: 'Não informado',
    budget: 'Não informado',
    organization: 'Não informado',
    organizationDescription: 'Preferência não informada.',
    environment: 'Não informado',
    environmentDescription: 'Preferência não informada.',
    smoking: 'Não informado',
    smokingDescription: 'Preferência não informada.',
    reviews: [],
  };
}

function ProfileIcon({ name }) { return <span className="profile-icon-badge" aria-hidden="true"><LineIcon name={name} size={19} /></span>; }

function CompatibilityModal({ profile, targetUserId, onClose }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function loadCompatibility() {
      setLoading(true);
      setError('');
      setResult(null);
      if (!UUID_PATTERN.test(targetUserId || '')) {
        setError('Este perfil de demonstração não está associado a uma conta da API.');
        setLoading(false);
        return;
      }
      if (!getAccessToken()) {
        setError('Faça login para comparar seu perfil com o de outro estudante.');
        setLoading(false);
        return;
      }
      try {
        const data = await calculateCompatibility(targetUserId);
        if (!cancelled) setResult(data);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Não foi possível calcular a compatibilidade.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCompatibility();
    return () => { cancelled = true; };
  }, [targetUserId]);

  const score = result?.score ?? 0;
  const commonPoints = result?.commonPoints ?? [];
  const differences = result?.differences ?? [];
  const breakdown = result?.breakdown ?? [];
  const levelLabels = { HIGH: 'Alta compatibilidade', MEDIUM: 'Compatibilidade moderada', LOW: 'Baixa compatibilidade' };
  const iconByField = { sleepTime: 'moon', studyAtHome: 'graduation', organization: 'users', visitors: 'users', smoking: 'smokeFree', pets: 'homeGroup', cleaning: 'home', environment: 'moon', lifestyle: 'users' };

  return (
    <div className="compatibility-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="compatibility-modal" role="dialog" aria-modal="true" aria-labelledby="compatibility-title">
        <button className="compatibility-close" type="button" onClick={onClose} aria-label="Fechar janela">×</button>
        <h2 id="compatibility-title">Compatibilidade</h2>
        {loading ? <p className="compatibility-summary" role="status">Calculando compatibilidade…</p> : error ? <p className="compatibility-summary" role="alert">{error}</p> : result && <>
          <div className="compatibility-people">
            <div className="compatibility-person"><span className="compatibility-avatar avatar-ana">{result.target.name?.slice(0, 2).toLocaleUpperCase('pt-BR') || profile.initials}</span><strong>{result.target.name}</strong><small>Perfil de estudante</small></div>
            <div className="compatibility-score" style={{ '--compatibility-score': `${score}%` }}><span className="compatibility-fit-icon" aria-hidden="true"><LineIcon name="homeGroup" size={15} /></span><div><strong>{score}%</strong><small>Compatibilidade</small></div></div>
            <div className="compatibility-person"><span className="compatibility-avatar avatar-you">{result.viewer.name?.slice(0, 2).toLocaleUpperCase('pt-BR')}</span><strong>{result.viewer.name}</strong><small>Seu perfil</small></div>
          </div>
          <p className={`compatibility-summary level-${(result.level || 'medium').toLowerCase()}`}><span className="compatibility-level">{levelLabels[result.level] || 'Compatibilidade'}</span>{result.summary}</p>
          {breakdown.length > 0 && <section className="compatibility-breakdown" aria-label="Compatibilidade por característica"><h3>Por característica</h3><ul>{breakdown.map((criterion) => <li key={criterion.field}><span>{criterion.label}</span><span className="compatibility-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={criterion.similarity} aria-label={`${criterion.label}: ${criterion.similarity}%`}><i style={{ width: `${criterion.similarity}%` }} /></span><small>{criterion.similarity}%</small></li>)}</ul></section>}
          <section className="compatibility-list common-list"><h3><span>✓</span>Pontos em comum <small>{commonPoints.length} itens</small></h3>{commonPoints.length ? <ul>{commonPoints.map((point, index) => <li key={`${point.field}-${index}`}><ProfileIcon name={iconByField[point.field] || 'users'} />{point.message}</li>)}</ul> : <p>Ainda não há respostas semelhantes entre os perfis.</p>}</section>
          <section className="compatibility-list difference-list"><h3><span>!</span>Diferenças para conversar <small>{differences.length} itens</small></h3>{differences.length ? <ul>{differences.map((point, index) => <li className={point.critical ? 'is-critical' : undefined} key={`${point.field}-${index}`}><ProfileIcon name={iconByField[point.field] || 'users'} />{point.critical && <strong className="compatibility-critical-tag">Importante</strong>}{point.message}</li>)}</ul> : <p>Nenhuma diferença foi encontrada nas respostas cadastradas.</p>}</section>
          <p className="compatibility-note">O índice compara as respostas de convivência informadas pelos dois estudantes. Ele ajuda a iniciar uma conversa, mas não garante que a convivência será compatível.</p>
        </>}
      </section>
    </div>
  );
}

export function UserProfilePage() {
  const { id } = useParams();
  const demoUser = getDemoUser();
  const displayName = demoUser?.name || 'Aluno';
  const isOwnProfile = !id || id === demoUser?.userId;
  const [profileRequest, setProfileRequest] = useState({
    id: null,
    user: null,
    loading: UUID_PATTERN.test(id || ''),
    error: '',
  });
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('sobre');
  const [reviewRequest, setReviewRequest] = useState({
    id: null,
    data: null,
    loading: UUID_PATTERN.test(id || ''),
    error: '',
  });
  const profile = profiles[id] ?? (
    profileRequest.id === id && profileRequest.user
      ? profileFromUser(profileRequest.user)
      : null
  );
  const profileLoading = !profiles[id] && (
    (UUID_PATTERN.test(id || '') && profileRequest.id !== id)
    || profileRequest.loading
  );
  const profileError = profileRequest.id === id && profileRequest.error
    ? profileRequest.error
    : !profileLoading && !profile && 'Este perfil não está disponível.';
  const contactParams = profile
    ? new URLSearchParams({ contato: id, nome: profile.name, papel: profile.role || 'Estudante' })
    : null;
  const profileReviews = profiles[id] ? profile.reviews : (
    reviewRequest.id === id ? reviewRequest.data?.items ?? [] : []
  );
  const profileReviewCount = profiles[id]
    ? profileReviews.length
    : reviewRequest.id === id ? reviewRequest.data?.reviewCount ?? 0 : 0;
  const profileReviewAverage = reviewRequest.id === id
    ? reviewRequest.data?.averageRating
    : null;

  useEffect(() => {
    let cancelled = false;

    if (!id || profiles[id]) {
      setProfileRequest({ id, user: null, loading: false, error: '' });
      return () => { cancelled = true; };
    }

    if (!UUID_PATTERN.test(id)) {
      setProfileRequest({ id, user: null, loading: false, error: 'Este perfil não está disponível.' });
      return () => { cancelled = true; };
    }

    setProfileRequest({ id, user: null, loading: true, error: '' });
    getUserById(id)
      .then((user) => {
        if (!cancelled) setProfileRequest({ id, user, loading: false, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setProfileRequest({
            id,
            user: null,
            loading: false,
            error: error.message || 'Não foi possível carregar este perfil.',
          });
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!UUID_PATTERN.test(id || '')) {
      setReviewRequest({ id, data: null, loading: false, error: '' });
      return () => { cancelled = true; };
    }

    setReviewRequest({ id, data: null, loading: true, error: '' });
    getUserReviews(id)
      .then((data) => {
        if (!cancelled) setReviewRequest({ id, data, loading: false, error: '' });
      })
      .catch((error) => {
        if (!cancelled) {
          setReviewRequest({
            id,
            data: null,
            loading: false,
            error: error.message || 'Não foi possível consultar as avaliações deste perfil.',
          });
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="user-profile-dashboard">
      <DashboardSidebar active={isOwnProfile ? 'profile' : 'search'} />

      <main className="user-profile-main">
        <header className="dashboard-topbar profile-topbar">
          <label className="profile-search"><span aria-hidden="true">⌕</span><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="profile-top-actions"><button type="button" aria-label="Notificações"><LineIcon name="bell" size={21} /></button><AccountMenu className="profile-greeting-link"><span className="profile-small-avatar">{displayName.charAt(0).toLocaleUpperCase('pt-BR')}</span><span>Olá, {displayName}</span><span className="profile-top-chevron" /></AccountMenu></div>
        </header>
        <div className="profile-page-content">
          {!profile ? <section className="profile-load-state" role={profileLoading ? 'status' : 'alert'}>{profileLoading ? 'Carregando perfil…' : profileError}</section> : <>
          <section className="profile-hero">
            <div className={`profile-large-avatar ${id === 'carolina-lima' ? 'avatar-carolina' : ''}`} aria-label={`Foto de perfil de ${profile.name}`}>{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : profile.initials}<i /></div>
            <div className="profile-hero-info"><h1>{profile.name}</h1><p className="profile-role"><LineIcon name="graduation" size={14} /> {profile.role || 'Estudante'}</p><div className="profile-tags">{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="profile-hero-actions"><Link to={`/mensagens?${contactParams.toString()}`}><LineIcon name="message" size={15} /> Enviar mensagem</Link><button type="button" onClick={() => setShowCompatibility(true)}><LineIcon name="compatibility" size={16} /> Ver compatibilidade</button>{UUID_PATTERN.test(id || '') && !isOwnProfile && <button className="profile-report-button" type="button" onClick={() => setShowReportDialog(true)}>Denunciar perfil</button>}</div></div>
            <span className="profile-hero-blob profile-blob-green" /><span className="profile-hero-blob profile-blob-pink" />
          </section>
          <nav className="profile-tabs" aria-label="Seções do perfil"><a className={activeTab === 'sobre' ? 'active' : ''} href="#sobre" onClick={() => setActiveTab('sobre')}>Sobre</a><a className={activeTab === 'preferencias' ? 'active' : ''} href="#preferencias" onClick={() => setActiveTab('preferencias')}>Preferências de Moradia</a><a className={activeTab === 'habitos' ? 'active' : ''} href="#habitos" onClick={() => setActiveTab('habitos')}>Hábitos e Rotina</a><a className={activeTab === 'avaliacoes' ? 'active' : ''} href="#avaliacoes" onClick={() => setActiveTab('avaliacoes')}>Avaliações Anteriores</a></nav>
          <div className="profile-info-grid" id="sobre">
            <section className="profile-panel profile-about"><h2><ProfileIcon name="person" />Sobre mim</h2><p>{profile.about}</p></section>
            <section className="profile-panel profile-academics"><h2><ProfileIcon name="graduation" />Informações acadêmicas</h2><div className="academic-detail"><ProfileIcon name="graduation" /><div><small>Curso</small><strong>{profile.course}</strong></div></div><div className="academic-detail"><ProfileIcon name="calendar" /><div><small>Período</small><strong>{profile.period}</strong></div></div></section>
          </div>
          <section className="profile-panel profile-preferences" id="preferencias"><h2><ProfileIcon name="home" />Preferências de Moradia</h2><div className="profile-preference-grid"><div><ProfileIcon name="homeGroup" /><span><small>Tipo de moradia</small><strong>{profile.housing}</strong></span></div><div><ProfileIcon name="pin" /><span><small>Localização</small><strong>{profile.distance}</strong></span></div><div><ProfileIcon name="home" /><span><small>Comodidades</small><strong>{profile.amenities}</strong></span></div><div><ProfileIcon name="money" /><span><small>Valor máximo</small><strong>{profile.budget}</strong></span></div></div></section>
          <section className="profile-panel profile-habits" id="habitos"><h2><ProfileIcon name="users" />Hábitos e Rotina</h2><div className="profile-habit-grid"><div><ProfileIcon name="users" /><span><strong>{profile.organization}</strong><small>{profile.organizationDescription || 'Gosta de manter o ambiente limpo e organizado'}</small></span></div><div><ProfileIcon name="moon" /><span><strong>{profile.environment}</strong><small>{profile.environmentDescription || 'Prefere um local calmo e com boa convivência'}</small></span></div><div><ProfileIcon name="smokeFree" /><span><strong>{profile.smoking}</strong><small>{profile.smokingDescription || 'Prefere ambientes livres de fumo'}</small></span></div></div></section>
          <section className="profile-panel profile-reviews" id="avaliacoes"><h2><ProfileIcon name="star" />Avaliações Anteriores{profileReviewCount > 0 && <span className="profile-review-summary">{profileReviewCount} {profileReviewCount === 1 ? 'avaliação' : 'avaliações'}{profileReviewAverage !== null && profileReviewAverage !== undefined ? ` · média ${profileReviewAverage.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5` : ''}</span>}</h2>{reviewRequest.id === id && reviewRequest.loading ? <p className="profile-review-load" role="status">Consultando avaliações…</p> : reviewRequest.id === id && reviewRequest.error ? <p className="profile-review-load" role="alert">{reviewRequest.error}</p> : profileReviews.length ? <div className="review-grid">{profileReviews.map((review) => {
            const stars = review.overall ?? review.stars;
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString('pt-BR')
              : review.date;
            return <article className="review-card" key={review.id || `${review.title}-${date}`}><div><strong>{review.listingTitle || review.title}</strong><time>{date}</time></div><span className="review-stars" aria-label={`${stars} estrelas`}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>{review.id && <small className="review-author">Avaliação de inquilino com contrato verificado</small>}<p>{review.comment || review.text}</p></article>;
          })}</div> : <div className="no-reviews"><LineIcon name="emptyReview" size={29} /><strong>Ainda não há avaliações para este perfil.</strong><p>Avaliações são publicadas por inquilinos com contrato iniciado. Compartilhe sua experiência elegível.</p><Link to="/avaliar-moradia">Avaliar uma moradia</Link></div>}</section>
          </>}
        </div>
      </main>
      {showCompatibility && profile && <CompatibilityModal profile={profile} targetUserId={id} onClose={() => setShowCompatibility(false)} />}
      {showReportDialog && profile && <ReportDialog targetUserId={id} targetName={profile.name} onClose={() => setShowReportDialog(false)} />}
    </div>
  );
}
