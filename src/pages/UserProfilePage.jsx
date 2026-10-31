import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
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

const currentUser = { name: 'Você', initials: 'AL', course: 'Ciência da Computação', period: '5º período' };
const sharedPoints = ['Ambas buscam apartamento compartilhado', 'Ambas preferem morar até 5 km do campus', 'Ambas não fumam', 'Ambas valorizam um ambiente tranquilo', 'Ambas gostam de manter o ambiente organizado'];

function ProfileIcon({ name }) { return <span className="profile-icon-badge" aria-hidden="true"><LineIcon name={name} size={19} /></span>; }

function SidebarIcon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
    announce: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h9M9 21v-7h6v4" /><path d="M19 14v7m-3.5-3.5h7" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.2-.6L4 20l1.4-3.7A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h8M8 9h5" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CompatibilityModal({ profile, onClose }) {
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const differences = profile.name === 'Ana Beatriz'
    ? ['Você busca aluguel de até R$ 600, enquanto Ana busca até R$ 800.', 'Você prefere poucas visitas; Ana recebe visitas às vezes.']
    : ['Carolina prefere um apartamento compartilhado; você também considera repúblicas.', 'A faixa de orçamento de vocês é diferente.'];
  const score = profile.name === 'Ana Beatriz' ? 78 : 86;

  return (
    <div className="compatibility-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="compatibility-modal" role="dialog" aria-modal="true" aria-labelledby="compatibility-title">
        <button className="compatibility-close" type="button" onClick={onClose} aria-label="Fechar janela">×</button>
        <h2 id="compatibility-title">Compatibilidade</h2>
        <div className="compatibility-people">
          <div className="compatibility-person"><span className="compatibility-avatar avatar-ana">{profile.initials}</span><strong>{profile.name}</strong><small>{profile.period}</small><small>{profile.course}</small></div>
          <div className="compatibility-score" style={{ '--compatibility-score': `${score}%` }}><span className="compatibility-fit-icon" aria-hidden="true"><LineIcon name="homeGroup" size={15} /></span><div><strong>{score}%</strong><small>Compatibilidade</small></div></div>
          <div className="compatibility-person"><span className="compatibility-avatar avatar-you">{currentUser.initials}</span><strong>{currentUser.name}</strong><small>{currentUser.period}</small><small>{currentUser.course}</small></div>
        </div>
        <p className="compatibility-summary">Vocês possuem várias preferências em comum e podem ter uma boa convivência!</p>
        <section className="compatibility-list common-list"><h3><span>✓</span>Pontos em comum <small>{sharedPoints.length} itens</small></h3><ul>{sharedPoints.map((point, index) => <li key={point}><ProfileIcon name={['home', 'pin', 'smokeFree', 'moon', 'users'][index]} />{point}</li>)}</ul></section>
        <section className="compatibility-list difference-list"><h3><span>!</span>Possíveis incompatibilidades <small>{differences.length} itens</small></h3><ul>{differences.map((point, index) => <li key={point}><ProfileIcon name={index === 0 ? 'money' : 'users'} />{point}</li>)}</ul></section>
        <p className="compatibility-note">Essas informações são baseadas nas preferências cadastradas por cada usuário e podem ajudar na sua decisão. Converse para alinhar expectativas. 💛</p>
      </section>
    </div>
  );
}

export function UserProfilePage() {
  const { id } = useParams();
  const isOwnProfile = !id;
  const profile = profiles[id] ?? profiles['ana-beatriz'];
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [activeTab, setActiveTab] = useState('sobre');

  return (
    <div className="user-profile-dashboard">
      <aside className="dashboard-sidebar profile-sidebar">
        <Link className="dashboard-brand" to="/buscar" aria-label="Moraê, explorar moradias"><Logo /></Link>
        <nav className="dashboard-nav" aria-label="Menu do buscador">
          <Link to="/"><SidebarIcon name="home" />Início</Link>
          <Link className={!isOwnProfile ? 'selected' : ''} to="/buscar"><SidebarIcon name="search" />Buscar vagas</Link>
          <Link className="announce-nav" to="/anunciar"><SidebarIcon name="announce" />Anunciar imóvel</Link>
          <Link to="/mensagens"><SidebarIcon name="message" />Minhas Mensagens</Link>
          <Link to="/buscar?favoritos=1"><SidebarIcon name="heart" />Meus Favoritos</Link>
          <Link className={isOwnProfile ? 'selected' : ''} to="/perfil"><SidebarIcon name="user" />Meu Perfil</Link>
        </nav>
        <div className="sidebar-note"><SidebarIcon name="shield" /><p>Busque com mais tranquilidade. Converse com anunciantes verificados.</p></div>
        <span className="sidebar-version">Moraê · Maceió, AL</span>
      </aside>

      <main className="user-profile-main">
        <header className="dashboard-topbar profile-topbar">
          <label className="profile-search"><span aria-hidden="true">⌕</span><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="profile-top-actions"><button type="button" aria-label="Notificações"><LineIcon name="bell" size={21} /></button><span className="profile-small-avatar">A</span><span>Olá, Aluno</span><span className="profile-top-chevron" /></div>
        </header>
        <div className="profile-page-content">
          <section className="profile-hero">
            <div className={`profile-large-avatar ${id === 'carolina-lima' ? 'avatar-carolina' : ''}`} aria-label={`Foto de perfil de ${profile.name}`}>{profile.initials}<i /></div>
            <div className="profile-hero-info"><h1>{profile.name}</h1><p className="profile-role"><LineIcon name="graduation" size={14} /> Estudante</p><div className="profile-tags">{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="profile-hero-actions"><Link to="/mensagens"><LineIcon name="message" size={15} /> Enviar mensagem</Link><button type="button" onClick={() => setShowCompatibility(true)}><LineIcon name="compatibility" size={16} /> Ver compatibilidade</button></div></div>
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
      {showCompatibility && <CompatibilityModal profile={profile} onClose={() => setShowCompatibility(false)} />}
    </div>
  );
}
