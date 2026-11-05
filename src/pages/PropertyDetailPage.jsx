import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import { getDemoUser } from '../utils/demoUser.js';
import { getDemoListing } from '../utils/demoListings.js';
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

export function PropertyDetailPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const user = getDemoUser();
  const isOwner = user?.role === 'proprietario' || user?.role === 'ofertante' || pathname.startsWith('/proprietario') || pathname.startsWith('/ofertante');
  const role = user?.role === 'ofertante' || pathname.startsWith('/ofertante') ? 'ofertante' : 'proprietario';
  const [query, setQuery] = useState('');
  const [interested, setInterested] = useState(false);
  const property = useMemo(() => {
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
    } : source;
  }, [id]);
  const messageParams = new URLSearchParams({ contato: property?.hostId ?? 'anunciante-morae', nome: property?.host ?? 'Anunciante', papel: property?.hostRole ?? 'Anunciante', imovel: property?.title ?? '' });
  if (!property) return <section className="property-detail-empty"><h1>Anúncio não encontrado</h1><Link to="/buscar">Voltar para buscar imóveis</Link></section>;
  const backPath = role === 'ofertante' ? '/ofertante/vagas' : isOwner ? '/proprietario/imoveis' : '/buscar';
  return <div className={`property-detail-shell${isOwner ? ' owner-detail-shell' : ''}`}>
    {isOwner ? <OwnerSidebar pathname={pathname} role={role} /> : <DashboardSidebar active="search" />}
    <main className="property-detail-main">
      {isOwner ? <OwnerTopbar query={query} setQuery={setQuery} role={role} /> : <header className="dashboard-topbar property-detail-topbar"><Link className="detail-back-link" to={backPath}>← Voltar</Link><span>Detalhes do imóvel</span><span className="property-detail-greeting">Olá, {user?.name || 'Aluno'}</span></header>}
      <div className="property-detail-content">
        <Link className="property-detail-back" to={backPath}>← Voltar aos anúncios</Link>
        <div className="property-detail-grid">
          <article className="property-detail-card">
            <PropertyPhoto type={property.image} />
            <div className="property-detail-copy"><span className="property-detail-eyebrow">Moraê · Maceió, AL</span><h1>{property.title}</h1><p className="property-detail-location"><LineIcon name="pin" size={17} />{property.neighborhood} · Maceió/AL <span>{property.distance}</span></p><strong className="property-detail-price">R$ {property.rent.toLocaleString('pt-BR')}<small>/mês</small></strong><p className="property-detail-description">{property.description}</p><h2>Sobre o imóvel</h2><div className="property-detail-facts"><span><LineIcon name="home" />{property.type}</span><span><LineIcon name="homeGroup" />{property.room}</span><span><LineIcon name="users" />Moradia estudantil</span></div><h2>O que oferece</h2><div className="property-detail-amenities">{property.amenities.map((item) => <span key={item}>{item}</span>)}</div></div>
          </article>
          <aside className="property-contact-card"><h2>Anunciante</h2><p className="property-host-avatar">{property.host.charAt(0)}</p><strong>{property.host}</strong><span>{property.hostRole || 'Anunciante Moraê'}</span><Link className="property-message-button" to={`/mensagens?${messageParams.toString()}`}><LineIcon name="message" />Enviar mensagem</Link>{!isOwner && <button className="property-interest-button" type="button" onClick={() => setInterested((value) => !value)}>{interested ? 'Interesse registrado ✓' : 'Tenho interesse'}</button>}<p className="property-safety-note"><LineIcon name="shield" />Converse pela plataforma e combine uma visita com segurança.</p></aside>
        </div>
      </div>
    </main>
  </div>;
}
