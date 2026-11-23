import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { ReportDialog } from '../components/ReportDialog.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import { MapView } from '../components/MapView/MapView.jsx';
import { getDemoUser } from '../utils/demoUser.js';
import { getDemoListing } from '../utils/demoListings.js';
import {
  getAccessToken,
  getApprovedListing,
  sendChatMessage,
  startDirectChat,
  getMyInterestStatus,
  submitInterest,
  withdrawInterest,
} from '../services/api.js';
import { OwnerSidebar, OwnerTopbar, PropertyPhoto } from './OwnerDashboardPage.jsx';
import './PropertyDetailPage.css';

const propertyData = {
  '1': { title: 'Apartamento com vista para o mar', neighborhood: 'Clima Bom', type: 'Apartamento', room: '2 quartos', rent: 900, image: 'apartment', host: 'Lucas Souza', hostId: 'proprietario-lucas-souza', hostRole: 'Proprietário', description: 'Apartamento mobiliado, com boa iluminação e acesso fácil ao transporte e à UFAL.', distance: '1,8 km da UFAL', amenities: ['WI-FI', 'Mobiliado', 'Próximo à UFAL'] },
  '2': { title: 'Casa compartilhada com quintal', neighborhood: 'Benedito Bentes', type: 'Casa', room: '3 quartos', rent: 850, image: 'house', host: 'Lucas Souza', hostId: 'proprietario-lucas-souza', hostRole: 'Proprietário', description: 'Casa compartilhada com quintal, ambientes arejados e espaços comuns mobiliados.', distance: '4,2 km da UFAL', amenities: ['WI-FI', 'Quintal', 'Mobiliado'] },
  '3': { title: 'Quarto individual aconchegante', neighborhood: 'Farol', type: 'Quarto', room: '1 quarto', rent: 600, image: 'house', host: 'Ana Beatriz', hostId: 'ana-beatriz', hostRole: 'Estudante ofertadora', description: 'Quarto individual em moradia estudantil, com ambiente tranquilo e áreas compartilhadas.', distance: '3,1 km da UFAL', amenities: ['WI-FI', 'Quarto individual', 'Mobiliado'] },
  '4': { title: 'Quarto em apartamento no Village', neighborhood: 'Village Campestre', type: 'Quarto', room: '2 quartos', rent: 500, image: 'apartment', host: 'Carolina Lima', hostId: 'carolina-lima', hostRole: 'Estudante ofertadora', description: 'Vaga em apartamento compartilhado, perto da universidade e com cozinha equipada.', distance: '2,5 km da UFAL', amenities: ['WI-FI', 'Compartilhado', 'Próximo à UFAL'] },
  'apt-ufal': { title: 'Apartamento próximo à UFAL', neighborhood: 'Clima Bom', type: 'Apartamento', room: 'Quarto individual', rent: 600, image: 'apartment', host: 'Lucas Souza', hostId: 'proprietario-lucas-souza', hostRole: 'Proprietário', description: 'Apartamento próximo à UFAL, com quarto individual e estrutura para uma convivência confortável.', distance: 'Próximo à UFAL', amenities: ['WI-FI', 'Mobiliado', '2 moradores'] },
  'casa-farol': { title: 'Casa compartilhada no Farol', neighborhood: 'Farol', type: 'Casa', room: 'Quarto individual', rent: 700, image: 'house', host: 'Lucas Souza', hostId: 'proprietario-lucas-souza', hostRole: 'Proprietário', description: 'Casa compartilhada no Farol, com ambientes mobiliados e acesso conveniente a serviços e transporte.', distance: 'Farol · Maceió/AL', amenities: ['WI-FI', 'Cozinha compartilhada', '2 moradores'] },
  'kitnet-ponta-verde': { title: 'Kitnet mobiliada na Ponta Verde', neighborhood: 'Ponta Verde', type: 'Kitnet', room: 'Imóvel inteiro', rent: 950, image: 'kitnet', host: 'Lucas Souza', hostId: 'proprietario-lucas-souza', hostRole: 'Proprietário', description: 'Kitnet mobiliada em uma das regiões mais acessíveis de Maceió.', distance: 'Ponta Verde · Maceió/AL', amenities: ['WI-FI', 'Mobiliado', 'Imóvel inteiro'] },
  'vaga-village': { title: 'Apartamento compartilhado – Village', neighborhood: 'Village Campestre', type: 'Apartamento', room: 'Quarto individual', rent: 500, image: 'apartment', host: 'Maria Letícia', hostId: 'aluno-ofertador-maria-leticia', hostRole: 'Aluno ofertador', description: 'Vaga em apartamento compartilhado, ideal para estudante que busca dividir as despesas e a rotina.', distance: 'Village Campestre · Maceió/AL', amenities: ['WI-FI', 'Compartilhado', '2 moradores'] },
  'vaga-farol': { title: 'Casa compartilhada no Farol', neighborhood: 'Farol', type: 'Casa', room: 'Quarto individual', rent: 700, image: 'house', host: 'Maria Letícia', hostId: 'aluno-ofertador-maria-leticia', hostRole: 'Aluno ofertador', description: 'Vaga em casa compartilhada, com quarto individual e espaços comuns mobiliados.', distance: 'Farol · Maceió/AL', amenities: ['WI-FI', 'Cozinha compartilhada', '2 moradores'] },
};

const tabs = ['Descrição', 'Características', 'Convivência', 'Contrato', 'Regras'];
const featureRows = [
  ['Tipo de moradia', 'República'], ['Quartos', '4 quartos'], ['Banheiros', '2'],
  ['Mobiliado', 'Sim'], ['Lavanderia', 'Sim'], ['Varanda', 'Não'],
  ['Garagem', 'Não'], ['Tipo de ambiente', 'Compartilhado'],
];
const rules = ['Respeitar horários de silêncio', 'Manter os espaços compartilhados limpos', 'Visitas com aviso prévio', 'Não é permitido fumar'];

function SectionHeading({ children }) {
  return <h2 className="detail-section-heading"><span><LineIcon name="document" size={17} /></span>{children}</h2>;
}

export function PropertyDetailPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getDemoUser();
  const isOwner = user?.role === 'proprietario' || user?.role === 'ofertante' || pathname.startsWith('/proprietario') || pathname.startsWith('/ofertante');
  const role = user?.role === 'ofertante' || pathname.startsWith('/ofertante') ? 'ofertante' : 'proprietario';
  const [query, setQuery] = useState('');
  const [notification, setNotification] = useState('');
  const [publishedListing, setPublishedListing] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [interest, setInterest] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('Descrição');
  const [photo, setPhoto] = useState(0);
  const [message, setMessage] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const displayName = user?.name || 'Aluno';
  const avatarInitial = displayName.charAt(0).toLocaleUpperCase('pt-BR');
  const isListingId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '');

  useEffect(() => {
    if (!isListingId) {
      setPublishedListing(null);
      setListingLoading(false);
      return undefined;
    }

    let cancelled = false;
    setPublishedListing(null);
    setListingLoading(true);
    getApprovedListing(id)
      .then((listing) => {
        if (!cancelled) setPublishedListing(listing);
      })
      .catch((error) => {
        if (!cancelled) setNotification(error.message || 'Não foi possível carregar o anúncio.');
      })
      .finally(() => {
        if (!cancelled) setListingLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, isListingId]);

  useEffect(() => {
    if (!isListingId || !getAccessToken()) {
      setInterest(null);
      setInterestLoading(false);
      setInterestError('');
      return undefined;
    }
    let cancelled = false;
    setInterestLoading(true);
    setInterestError('');
    getMyInterestStatus(id)
      .then((result) => {
        if (!cancelled) setInterest(result);
      })
      .catch((error) => {
        if (!cancelled) setInterestError(error.message || 'Não foi possível consultar sua manifestação.');
      })
      .finally(() => {
        if (!cancelled) setInterestLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, isListingId]);

  const property = useMemo(() => {
    if (publishedListing?.listingId === id) {
      const typeLabels = {
        APARTMENT: 'Apartamento',
        HOUSE: 'Casa',
        ROOM: 'Quarto',
        REPUBLIC: 'República',
      };
      return {
        listingId: publishedListing.listingId,
        persisted: true,
        title: publishedListing.title,
        neighborhood: publishedListing.location.neighborhood,
        type: typeLabels[publishedListing.housingType] || publishedListing.housingType,
        room: `${publishedListing.bedrooms} quartos`,
        rooms: String(publishedListing.bedrooms),
        bathrooms: String(publishedListing.bathrooms),
        rent: publishedListing.rent,
        image: publishedListing.housingType === 'HOUSE' ? 'house' : 'apartment',
        photoUrl: publishedListing.media.find((item) => item.type === 'PHOTO')?.url,
        host: publishedListing.advertiser.name,
        hostId: publishedListing.advertiser.userId,
        hostRole: 'Anunciante',
        description: publishedListing.description,
        distance: `${publishedListing.location.city}/${publishedListing.location.state}`,
        amenities: publishedListing.amenities,
        rules: publishedListing.rules ? publishedListing.rules.split(/[\n,;]/).map((rule) => rule.trim()).filter(Boolean) : rules,
        advertiserId: publishedListing.advertiser.userId,
      };
    }
    const source = propertyData[id];
    if (!source) return null;
    const listing = getDemoListing(id);
    return listing ? {
      ...source,
      title: listing.listingTitle || source.title,
      neighborhood: listing.neighborhood || source.neighborhood,
      type: listing.propertyType || source.type,
      room: listing.rooms ? `${listing.rooms} quartos` : source.room,
      rent: Number(listing.rent || source.rent),
      description: listing.description || source.description,
      amenities: listing.amenities?.length ? listing.amenities : source.amenities,
      rooms: listing.rooms || '4',
      bathrooms: listing.bathrooms || '2',
      rules: listing.rules ? listing.rules.split(/[\n,;]/).map((rule) => rule.trim()).filter(Boolean) : rules,
    } : source;
  }, [id, publishedListing]);

  if (listingLoading) return <section className="property-detail-empty" role="status"><h1>Carregando anúncio…</h1></section>;
  if (!property) return <section className="property-detail-empty"><h1>Anúncio não encontrado</h1><Link to="/buscar">Voltar para buscar imóveis</Link>{notification && <p role="alert">{notification}</p>}</section>;

  const messageParams = new URLSearchParams({ contato: property.hostId, nome: property.host, papel: property.hostRole, imovel: property.title, ...(property.persisted ? { anuncio: property.listingId } : {}) });
  const backPath = role === 'ofertante' ? '/ofertante/vagas' : isOwner ? '/proprietario/imoveis' : '/buscar';
  // Envia a primeira mensagem ao anunciante com o anúncio anexado e abre a
  // conversa em Minhas Mensagens, onde ela continua em tempo real.
  const sendMessage = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || chatSending) return;
    if (!property.persisted) {
      setChatError('Este anúncio é demonstrativo e não aceita mensagens.');
      return;
    }
    if (!getAccessToken()) {
      setChatError('Entre na sua conta para enviar mensagens.');
      return;
    }
    setChatSending(true);
    setChatError('');
    try {
      const chat = await startDirectChat({ listingId: property.listingId });
      await sendChatMessage(chat.id, { content, listingId: property.listingId });
      setMessage('');
      navigate(`/mensagens?conversa=${encodeURIComponent(chat.id)}`);
    } catch (error) {
      setChatError(error.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setChatSending(false);
    }
  };
  const interestStatusLabels = {
    PENDING: 'Aguardando resposta',
    IN_CONVERSATION: 'Em conversa',
    ACCEPTED: 'Aceito',
    REJECTED: 'Recusado',
    WITHDRAWN: 'Retirado',
  };
  const isListingOwner = property.persisted && property.advertiserId === user?.userId;
  const canWithdrawInterest = interest && ['PENDING', 'IN_CONVERSATION', 'ACCEPTED'].includes(interest.status);

  async function handleInterest() {
    setInterestError('');
    if (!property.persisted) {
      setInterestError('Este anúncio é demonstrativo e não aceita manifestações persistidas.');
      return;
    }
    if (!getAccessToken()) {
      setInterestError('Entre na sua conta para demonstrar interesse.');
      return;
    }
    setInterestLoading(true);
    try {
      if (canWithdrawInterest) {
        await withdrawInterest(property.listingId);
        setInterest(await getMyInterestStatus(property.listingId));
      } else {
        setInterest(await submitInterest(property.listingId));
      }
    } catch (error) {
      setInterestError(error.message || 'Não foi possível atualizar sua manifestação.');
    } finally {
      setInterestLoading(false);
    }
  }

  return <div className={`property-detail-shell${isOwner ? ' owner-detail-shell' : ''}`}>
    {isOwner ? <OwnerSidebar pathname={pathname} role={role} /> : <DashboardSidebar active="search" />}
    <main className="property-detail-main">
      {isOwner ? <OwnerTopbar query={query} setQuery={setQuery} role={role} /> : <header className="dashboard-topbar property-detail-topbar">
        <form className="top-search" onSubmit={(event) => event.preventDefault()}>
          <LineIcon name="search" size={22} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" />
        </form>
        <div className="topbar-actions">
          <button className="icon-button notification-button" type="button" onClick={() => setNotification((current) => current ? '' : 'Você está em dia! Não há novas notificações.')} aria-label="Notificações"><LineIcon name="bell" size={22} /><i /></button>
          <span className="topbar-divider" />
          <Link className="profile-menu" to="/perfil"><span className="profile-avatar">{avatarInitial}</span><span>Olá, {displayName}</span><span className="chevron" aria-hidden="true" /></Link>
        </div>
        {notification && <div className="notification-popover"><button type="button" onClick={() => setNotification('')} aria-label="Fechar">×</button>{notification}</div>}
      </header>}
      <div className="property-detail-content">
        <Link className="property-detail-back" to={backPath}>← Voltar aos anúncios</Link>
        {property.persisted && !isListingOwner && <button className="property-report-action" onClick={() => setShowReportDialog(true)} type="button">Denunciar anúncio</button>}
        <div className="property-detail-columns">
          <aside className="property-detail-left">
            <section className="detail-gallery-card" aria-label="Fotos do imóvel">
              <div className={`detail-gallery-photo detail-photo-${property.image}`}>{property.photoUrl ? <img className="detail-listing-photo" src={property.photoUrl} alt={property.title} /> : <PropertyPhoto type={property.image} />}<span className="detail-photo-count">{photo + 1}/8</span><button type="button" className="detail-gallery-arrow previous" aria-label="Foto anterior" onClick={() => setPhoto((current) => (current + 7) % 8)}>‹</button><button type="button" className="detail-gallery-arrow next" aria-label="Próxima foto" onClick={() => setPhoto((current) => (current + 1) % 8)}>›</button></div>
              <div className="detail-gallery-thumbnails">{Array.from({ length: 4 }, (_, index) => <button type="button" key={index} className={photo % 4 === index ? 'selected' : ''} onClick={() => setPhoto(index)} aria-label={`Ver foto ${index + 1}`}><PropertyPhoto type={property.image} /></button>)}</div>
            </section>
            <section className="detail-price-card"><SectionHeading>Valor e condições</SectionHeading><div className="detail-price-info"><LineIcon name="money" /><span>Valor do aluguel<strong>R$ {property.rent.toLocaleString('pt-BR')}/mês</strong></span></div><div className="detail-price-info"><LineIcon name="document" /><span>Taxas adicionais<strong>Água, luz e internet já inclusas</strong></span></div></section>
            <section className="detail-location-section"><h2><span><LineIcon name="pin" size={21} /></span>Localização</h2><div className="detail-map"><MapView properties={[{ id: property.hostId, name: property.title, neighborhood: property.neighborhood, price: property.rent }]} /><button type="button" className="detail-map-button"><LineIcon name="map" />Ver mapa</button></div></section>
          </aside>

          <div className="property-detail-center">
            <section className="detail-summary-card"><h1>{property.title === 'Apartamento próximo à UFAL' ? 'República Sol Nascente' : property.title}</h1><div className="detail-summary-location"><span><LineIcon name="pin" size={14} />{property.neighborhood} - Maceió/AL</span><span className="detail-tag">República</span><span className="detail-tag feminine">Feminina</span></div><div className="detail-summary-facts"><span><LineIcon name="homeGroup" /><span>{property.rooms || '4'} quartos<small>(2 disponíveis)</small></span></span><span><LineIcon name="home" /><span>{property.bathrooms || '2'} banheiros</span></span><span><LineIcon name="pin" /><span>Aproximadamente<small>{property.distance || '3,2 km da UFAL'}</small></span></span></div><strong className="detail-summary-price">R$ {property.rent.toLocaleString('pt-BR')}/mês</strong></section>
            <section className="detail-information-card"><nav className="detail-tabs" aria-label="Seções do anúncio">{tabs.map((tab) => <a key={tab} href={`#detail-${tab.toLowerCase()}`} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</a>)}</nav>
              <section id="detail-descrição" className="detail-info-section"><SectionHeading>Descrição</SectionHeading><div className="detail-description-text"><p>{property.description === 'Apartamento próximo à UFAL, com quarto individual e estrutura para uma convivência confortável.' ? 'A república Sol Nascente é uma moradia estudantil organizada e acolhedora, ideal para quem busca praticidade e um ambiente tranquilo para estudar e viver bem. Localizada no bairro A. C. Simões, em Maceió, fica próxima à UFAL, com fácil acesso a mercados, farmácias, ponto de ônibus e restaurantes.' : property.description}</p><p>O espaço conta com {property.rooms || '4'} quartos (sendo 2 disponíveis), {property.bathrooms || '2'} banheiros, sala, cozinha equipada e área de serviço. Todos os ambientes são mobiliados e bem cuidados, oferecendo conforto e comodidade no dia a dia.</p><p>A moradia valoriza o respeito, a organização e a boa convivência entre os moradores.</p></div></section>
              <section id="detail-características" className="detail-info-section"><SectionHeading>Características do imóvel</SectionHeading><div className="detail-feature-grid">{featureRows.map(([label, value], index) => <div className="detail-feature" key={label}><span className="detail-feature-icon"><LineIcon name={['homeGroup', 'homeGroup', 'home', 'home', 'calendar', 'home', 'home', 'users'][index]} size={16} /></span><span>{label}<small>{index === 1 ? `${property.rooms || value.split(' ')[0]} quartos` : index === 2 ? property.bathrooms || value : value}</small></span></div>)}</div></section>
              <section id="detail-convivência" className="detail-info-section"><SectionHeading>Sobre a convivência</SectionHeading><div className="detail-community-grid"><div>Perfil dos moradores<strong>Feminino</strong></div><div>Idade<strong>18 - 25</strong></div><div>Cursos<strong>Diversos</strong></div><div>Preferência<strong>Estudantes da UFAL</strong></div></div><h3>Comodidades e Rotina</h3><div className="detail-community-grid routine"><div>Horário de silêncio<strong>21h - 08h</strong></div><div>Limpeza<strong>Semanal</strong></div><div>Área de lazer<strong>Não</strong></div><div>Permite pets<strong>Sim</strong></div></div></section>
              <section id="detail-contrato" className="detail-info-section"><SectionHeading>Contrato de locação</SectionHeading><p className="detail-contract-intro">Aqui você encontra um resumo das principais informações do contrato. O documento completo será disponibilizado após o seu interesse ser confirmado.</p><div className="detail-contract-list">{[['Tipo de contrato', 'Locação residencial (temporário)'], ['Prazo de vigência', '6 meses'], ['Caução', '1 mês de aluguel'], ['Multa por rescisão', 'Conforme contrato'], ['Forma de pagamento', 'Boleto ou transferência bancária']].map(([label, value]) => <div key={label}><span className="detail-contract-icon"><LineIcon name="document" size={16} /></span><strong>{label}</strong><span>{value}</span></div>)}</div><button className="detail-full-contract" type="button">Ver contrato completo em PDF</button></section>
              <section id="detail-regras" className="detail-info-section"><SectionHeading>Regras da casa</SectionHeading><div className="detail-rules">{(property.rules?.length ? property.rules : rules).map((rule) => <span key={rule}>{rule}</span>)}</div></section>
            </section>
          </div>

          <aside className="property-detail-right">
            <section className="detail-contact-panel"><div className="detail-contact-intro"><span><LineIcon name="person" /></span><strong>Interessado nessa moradia?</strong><p>Tire suas dúvidas com o responsável ou demonstre interesse ao imóvel.</p>{!isListingOwner && <button type="button" disabled={interestLoading || (interest?.status === 'REJECTED')} onClick={handleInterest}>{interestLoading ? 'Atualizando…' : canWithdrawInterest ? 'Retirar manifestação' : interest?.status === 'REJECTED' ? 'Manifestação recusada' : interest?.status === 'WITHDRAWN' ? 'Demonstrar interesse novamente' : interest ? 'Interesse demonstrado ✓' : 'Demonstrar Interesse'}</button>}{property.persisted && !getAccessToken() && <Link to="/login">Entrar para manifestar interesse</Link>}{interest?.status && <span className="detail-interest-status">Situação: {interestStatusLabels[interest.status]}</span>}{isListingOwner && <Link to={`/proprietario/interessados?imovel=${encodeURIComponent(property.listingId)}`}>Gerenciar interessados</Link>}{interestError && <p className="detail-interest-message" role="alert">{interestError}</p>}{!property.persisted && <p className="detail-interest-message">Anúncio demonstrativo: não permite envio real.</p>}<Link to={`/mensagens?${messageParams.toString()}`}>Enviar mensagem</Link></div><div className="detail-mini-chat"><h2><LineIcon name="users" />Chat da Moradia</h2><div className="detail-chat-history"><p className="from-host">{isListingOwner ? 'As mensagens dos interessados neste anúncio chegam em Minhas Mensagens.' : `Envie uma mensagem para ${property.host}. A conversa continua em Minhas Mensagens, em tempo real.`}</p></div>{isListingOwner ? <Link className="detail-chat-open" to="/mensagens">Abrir Minhas Mensagens</Link> : <form className="detail-chat-form" onSubmit={sendMessage}><input value={message} maxLength={10000} disabled={chatSending} onChange={(event) => setMessage(event.target.value)} placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem" /><button type="submit" aria-label="Enviar mensagem" disabled={chatSending || !message.trim()}><LineIcon name="send" size={14} /></button></form>}{chatError && <p className="detail-interest-message" role="alert">{chatError}</p>}</div></section>
            <section className="detail-residents-card"><h2><LineIcon name="users" />Sobre os moradores</h2><div><span>2 moradores</span><span>Estudantes</span><span>Organizados</span><span>Respeitosos</span></div><Link to={`/usuarios/${property.hostId}`}>Ver perfil dos moradores <LineIcon name="arrow" size={17} /></Link></section>
          </aside>
        </div>
      </div>
    </main>
    {showReportDialog && property.persisted && <ReportDialog listingId={property.listingId} listingTitle={property.title} onClose={() => setShowReportDialog(false)} />}
  </div>;
}
