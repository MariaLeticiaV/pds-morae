import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { AccountMenu } from '../components/AccountMenu.jsx';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LineIcon } from '../components/LineIcon.jsx';
import { calculateCompatibility, getAccessToken } from '../services/api.js';
import { getDemoUser } from '../utils/demoUser.js';
import './UserProfilePage.css';

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
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId || '')) {
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
          <p className="compatibility-summary">{result.summary}</p>
          <section className="compatibility-list common-list"><h3><span>✓</span>Pontos em comum <small>{commonPoints.length} itens</small></h3>{commonPoints.length ? <ul>{commonPoints.map((point, index) => <li key={`${point.field}-${index}`}><ProfileIcon name={iconByField[point.field] || 'users'} />{point.message}</li>)}</ul> : <p>Ainda não há respostas semelhantes entre os perfis.</p>}</section>
          <section className="compatibility-list difference-list"><h3><span>!</span>Diferenças para conversar <small>{differences.length} itens</small></h3>{differences.length ? <ul>{differences.map((point, index) => <li key={`${point.field}-${index}`}><ProfileIcon name={iconByField[point.field] || 'users'} />{point.message}</li>)}</ul> : <p>Nenhuma diferença foi encontrada nas respostas cadastradas.</p>}</section>
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
  const isOwnProfile = !id;
  const profile = profiles[id] ?? profiles['ana-beatriz'];
  const contactParams = new URLSearchParams({ contato: id || 'estudante-ana-beatriz', nome: profile.name, papel: 'Estudante' });
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [activeTab, setActiveTab] = useState('sobre');

  return (
    <div className="user-profile-dashboard">
      <DashboardSidebar active={isOwnProfile ? 'profile' : 'search'} />

      <main className="user-profile-main">
        <header className="dashboard-topbar profile-topbar">
          <label className="profile-search"><span aria-hidden="true">⌕</span><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="profile-top-actions"><button type="button" aria-label="Notificações"><LineIcon name="bell" size={21} /></button><AccountMenu className="profile-greeting-link"><span className="profile-small-avatar">{displayName.charAt(0).toLocaleUpperCase('pt-BR')}</span><span>Olá, {displayName}</span><span className="profile-top-chevron" /></AccountMenu></div>
        </header>
        <div className="profile-page-content">
          <section className="profile-hero">
            <div className={`profile-large-avatar ${id === 'carolina-lima' ? 'avatar-carolina' : ''}`} aria-label={`Foto de perfil de ${profile.name}`}>{profile.initials}<i /></div>
            <div className="profile-hero-info"><h1>{profile.name}</h1><p className="profile-role"><LineIcon name="graduation" size={14} /> Estudante</p><div className="profile-tags">{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="profile-hero-actions"><Link to={`/mensagens?${contactParams.toString()}`}><LineIcon name="message" size={15} /> Enviar mensagem</Link><button type="button" onClick={() => setShowCompatibility(true)}><LineIcon name="compatibility" size={16} /> Ver compatibilidade</button></div></div>
            <span className="profile-hero-blob profile-blob-green" /><span className="profile-hero-blob profile-blob-pink" />
          </section>
          <nav className="profile-tabs" aria-label="Seções do perfil"><a className={activeTab === 'sobre' ? 'active' : ''} href="#sobre" onClick={() => setActiveTab('sobre')}>Sobre</a><a className={activeTab === 'preferencias' ? 'active' : ''} href="#preferencias" onClick={() => setActiveTab('preferencias')}>Preferências de Moradia</a><a className={activeTab === 'habitos' ? 'active' : ''} href="#habitos" onClick={() => setActiveTab('habitos')}>Hábitos e Rotina</a><a className={activeTab === 'avaliacoes' ? 'active' : ''} href="#avaliacoes" onClick={() => setActiveTab('avaliacoes')}>Avaliações Anteriores</a></nav>
          <div className="profile-info-grid" id="sobre">
            <section className="profile-panel profile-about"><h2><ProfileIcon name="person" />Sobre mim</h2><p>{profile.about}</p></section>
            <section className="profile-panel profile-academics"><h2><ProfileIcon name="graduation" />Informações acadêmicas</h2><div className="academic-detail"><ProfileIcon name="graduation" /><div><small>Curso</small><strong>{profile.course}</strong></div></div><div className="academic-detail"><ProfileIcon name="calendar" /><div><small>Período</small><strong>{profile.period}</strong></div></div></section>
          </div>
          <section className="profile-panel profile-preferences" id="preferencias"><h2><ProfileIcon name="home" />Preferências de Moradia</h2><div className="profile-preference-grid"><div><ProfileIcon name="homeGroup" /><span><small>Tipo de moradia</small><strong>{profile.housing}</strong></span></div><div><ProfileIcon name="pin" /><span><small>Localização</small><strong>{profile.distance}</strong></span></div><div><ProfileIcon name="home" /><span><small>Comodidades</small><strong>{profile.amenities}</strong></span></div><div><ProfileIcon name="money" /><span><small>Valor máximo</small><strong>{profile.budget}</strong></span></div></div></section>
          <section className="profile-panel profile-habits" id="habitos"><h2><ProfileIcon name="users" />Hábitos e Rotina</h2><div className="profile-habit-grid"><div><ProfileIcon name="users" /><span><strong>{profile.organization}</strong><small>Gosta de manter o ambiente limpo e organizado</small></span></div><div><ProfileIcon name="moon" /><span><strong>{profile.environment}</strong><small>Prefere um local calmo e com boa convivência</small></span></div><div><ProfileIcon name="smokeFree" /><span><strong>{profile.smoking}</strong><small>Prefere ambientes livres de fumo</small></span></div></div></section>
          <section className="profile-panel profile-reviews" id="avaliacoes"><h2><ProfileIcon name="star" />Avaliações Anteriores</h2>{profile.reviews.length ? <div className="review-grid">{profile.reviews.map((review) => <article className="review-card" key={review.title}><div><strong>{review.title}</strong><time>{review.date}</time></div><span className="review-stars" aria-label={`${review.stars} estrelas`}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</span><p>{review.text}</p></article>)}</div> : <div className="no-reviews"><LineIcon name="emptyReview" size={29} /><strong>Ainda não há avaliações para este perfil.</strong><p>Se você já dividiu um espaço ou foi locador(a) desta pessoa, deixe sua opinião e ajude outros estudantes!</p></div>}</section>
        </div>
      </main>
      {showCompatibility && <CompatibilityModal profile={profile} targetUserId={id} onClose={() => setShowCompatibility(false)} />}
    </div>
  );
}
