import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { ReportDialog } from '../components/ReportDialog.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import { MapView } from '../components/MapView/MapView.jsx';
import { ListingPhotoManager } from '../components/ListingPhotoManager.jsx';
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


const propertyData = {};

const tabs = ['Descrição', 'Características', 'Regras'];

const featureRows = [];

const rules = [];

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
  // A rota pública só devolve anúncios aprovados; o status muda aqui quando
  // o dono adiciona fotos e o anúncio volta para a moderação.
  const [listingStatus, setListingStatus] = useState('APPROVED');
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
        if (!cancelled) {
          setPublishedListing(listing);
          setListingStatus('APPROVED');
        }
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
        photos: publishedListing.media.filter((item) => item.type === 'PHOTO'),
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
  const photos = property.photos ?? [];
  const photoIndex = photos.length ? Math.min(photo, photos.length - 1) : 0;
  const currentPhoto = photos[photoIndex];
  const showPhoto = (offset) => setPhoto((current) => (current + offset + photos.length) % photos.length);
  const updatePhotos = ({ status: nextStatus, photos: nextPhotos }) => {
    setListingStatus(nextStatus);
    setPublishedListing((current) => current && { ...current, media: nextPhotos });
    setPhoto((current) => Math.min(current, Math.max(nextPhotos.length - 1, 0)));
  };
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
              <div className={`detail-gallery-photo detail-photo-${property.image}`}>{currentPhoto ? <><img className="detail-listing-photo" src={currentPhoto.url} alt={`${property.title} – foto ${photoIndex + 1} de ${photos.length}`} />{photos.length > 1 && <><span className="detail-photo-count">{photoIndex + 1}/{photos.length}</span><button type="button" className="detail-gallery-arrow previous" aria-label="Foto anterior" onClick={() => showPhoto(-1)}>‹</button><button type="button" className="detail-gallery-arrow next" aria-label="Próxima foto" onClick={() => showPhoto(1)}>›</button></>}</> : <PropertyPhoto type={property.image} />}</div>
              {photos.length > 1 && <div className="detail-gallery-thumbnails">{photos.map((item, index) => <button type="button" key={item.id ?? item.url} className={photoIndex === index ? 'selected' : ''} onClick={() => setPhoto(index)} aria-label={`Ver foto ${index + 1}`}><img className="detail-thumbnail-photo" src={item.url} alt="" /></button>)}</div>}
            </section>
            {isListingOwner && <ListingPhotoManager listingId={property.listingId} status={listingStatus} photos={photos} onChange={updatePhotos} />}
            <section className="detail-price-card"><SectionHeading>Valor e condições</SectionHeading><div className="detail-price-info"><LineIcon name="money" /><span>Valor do aluguel<strong>R$ {property.rent.toLocaleString('pt-BR')}/mês</strong></span></div></section>
            <section className="detail-location-section"><h2><span><LineIcon name="pin" size={21} /></span>Localização</h2><div className="detail-map"><MapView properties={[{ id: property.hostId, name: property.title, neighborhood: property.neighborhood, price: property.rent }]} /><button type="button" className="detail-map-button"><LineIcon name="map" />Ver mapa</button></div></section>
          </aside>

          <div className="property-detail-center">
            <section className="detail-summary-card"><h1>{property.title}</h1><div className="detail-summary-location"><span><LineIcon name="pin" size={14} />{property.neighborhood} - Maceió/AL</span><span className="detail-tag">{property.type}</span></div><div className="detail-summary-facts"><span><LineIcon name="homeGroup" /><span>{property.rooms} quartos</span></span><span><LineIcon name="home" /><span>{property.bathrooms} banheiros</span></span><span><LineIcon name="pin" /><span>Localização<small>{property.distance}</small></span></span></div><strong className="detail-summary-price">R$ {property.rent.toLocaleString('pt-BR')}/mês</strong></section>
            <section className="detail-information-card"><nav className="detail-tabs" aria-label="Seções do anúncio">{tabs.map((tab) => <a key={tab} href={`#detail-${tab.toLowerCase()}`} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</a>)}</nav>
              <section id="detail-descrição" className="detail-info-section"><SectionHeading>Descrição</SectionHeading><div className="detail-description-text"><p>{property.description}</p></div></section>
              <section id="detail-características" className="detail-info-section"><SectionHeading>Características do imóvel</SectionHeading><div className="detail-feature-grid">{featureRows.map(([label, value], index) => <div className="detail-feature" key={label}><span className="detail-feature-icon"><LineIcon name={['homeGroup', 'homeGroup', 'home', 'home', 'calendar', 'home', 'home', 'users'][index]} size={16} /></span><span>{label}<small>{index === 1 ? `${property.rooms || value.split(' ')[0]} quartos` : index === 2 ? property.bathrooms || value : value}</small></span></div>)}</div></section>
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