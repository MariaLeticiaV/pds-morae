import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { LineIcon } from '../components/LineIcon.jsx';
import './AnnouncePropertyPage.css';

const steps = [
  { id: 'property-address', label: 'Informações básicas' },
  { id: 'property-features', label: 'Características' },
  { id: 'property-photos', label: 'Fotos e vídeo' },
  { id: 'property-review', label: 'Revisar e publicar' },
];

const amenities = [
  'WI-FI', 'Mobiliado', 'Cozinha equipada', 'Ar-condicionado',
  'Área de lazer', 'Lavanderia', 'Varanda', 'Elevador',
  'Estacionamento', 'Permite pets',
];

function FormField({ label, children, className = '' }) {
  return <label className={`announce-field${className ? ` ${className}` : ''}`}><span>{label}</span>{children}</label>;
}

function SectionHeading({ title, description }) {
  return <div className="announce-section-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function AnnouncePropertyPage() {
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState('');
  const [submittedListing, setSubmittedListing] = useState(null);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    const previews = photos.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotoPreviews(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [photos]);

  function addPhotoFiles(files) {
    const selected = Array.from(files ?? []);
    const images = selected.filter((file) => file.type.startsWith('image/'));
    const remaining = Math.max(0, 10 - photos.length);
    setPhotos((current) => [...current, ...images.slice(0, remaining)]);
    if (images.length < selected.length) setStatus('Selecione arquivos de imagem para adicionar às fotos.');
    else if (images.length > remaining) setStatus('O anúncio aceita no máximo 10 fotos.');
    else setStatus('');
  }

  function addPhotos(event) {
    addPhotoFiles(event.target.files);
    event.target.value = '';
  }

  function removePhoto(index) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  function submitAnnouncement(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmittedListing({
      ...Object.fromEntries(formData.entries()),
      amenities: formData.getAll('amenities'),
      photos: photoPreviews,
      videoName: video?.name ?? '',
    });
    document.querySelector('.announce-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startAnotherAnnouncement() {
    formRef.current?.reset();
    setPhotos([]);
    setVideo(null);
    setSubmittedListing(null);
    setStatus('');
  }

  return (
    <div className="announce-dashboard">
      <aside className="dashboard-sidebar announce-sidebar">
        <Link className="dashboard-brand" to="/" aria-label="Moraê, página inicial"><Logo /></Link>
        <nav className="dashboard-nav" aria-label="Menu principal">
          <Link to="/"><LineIcon name="home" />Início</Link>
          <Link to="/buscar"><LineIcon name="search" />Buscar vagas</Link>
          <Link className="selected" to="/anunciar"><LineIcon name="homeGroup" />Anunciar imóvel</Link>
          <Link to="/mensagens"><LineIcon name="message" />Minhas Mensagens</Link>
          <Link to="/buscar?favoritos=1"><LineIcon name="heart" />Meus Favoritos</Link>
          <Link to="/perfil"><LineIcon name="user" />Meu Perfil</Link>
        </nav>
        <span className="sidebar-version">Moraê · Maceió, AL</span>
      </aside>

      <main className="announce-main">
        <header className="dashboard-topbar announce-topbar">
          <label className="announce-global-search"><LineIcon name="search" size={21} /><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="announce-top-actions"><button type="button" aria-label="Notificações"><LineIcon name="bell" size={21} /></button><span className="announce-user-avatar">A</span><span>Olá, Aluno</span></div>
        </header>

        <div className="announce-content">
          {submittedListing && <section className="announce-submitted-hero" role="status">
            <div className="announce-submitted-icon"><LineIcon name="homeGroup" size={30} /></div>
            <div><p className="announce-kicker">Tudo pronto!</p><h1>Seu imóvel foi cadastrado com sucesso</h1><p>Agora, entraremos em contato assim que a análise for concluída.</p></div>
            <aside><strong>Fique tranquilo!</strong><span>Você será notificado por aqui e no seu e-mail quando o status do anúncio for atualizado.</span></aside>
          </section>}

          {submittedListing && <section className="announce-status-card">
            <h2>Acompanhe o status do seu anúncio</h2>
            <div className="announce-status-timeline">
              <div className="completed"><span>✓</span><strong>Cadastro concluído</strong></div>
              <div className="in-review"><span>2</span><strong>Em análise</strong></div>
              <div><span>3</span><strong>Aprovado e publicado</strong></div>
              <div><span>4</span><strong>Reprovado</strong></div>
            </div>
          </section>}

          {!submittedListing && <section className="announce-hero">
            <div className="announce-hero-icon"><LineIcon name="homeGroup" size={48} /></div>
            <div><p className="announce-kicker">Moraê · Anúncios</p><h1>Anunciar imóvel</h1><p>Preencha as informações do seu imóvel para atrair os melhores interessados.</p></div>
            <span className="announce-orbit announce-orbit-pink" /><span className="announce-orbit announce-orbit-green" />
          </section>}

          {!submittedListing && <nav className="announce-steps" aria-label="Etapas do formulário">
            {steps.map((step, index) => <a href={`#${step.id}`} key={step.id}><span>{index + 1}</span>{step.label}</a>)}
          </nav>}

          <form ref={formRef} className="announce-form" hidden={Boolean(submittedListing)} onSubmit={submitAnnouncement} onInput={() => setStatus('')}>
            <section className="announce-card" id="property-address">
              <SectionHeading title="Endereço do imóvel" description="Informe onde o imóvel está localizado." />
              <div className="announce-fields-grid address-fields">
                <FormField label="CEP *"><input name="cep" inputMode="numeric" autoComplete="postal-code" placeholder="Digite o CEP" required /></FormField>
                <FormField label="Estado *"><select name="state" defaultValue="" autoComplete="address-level1" required><option value="" disabled>Selecione</option><option value="AL">Alagoas</option><option value="PE">Pernambuco</option><option value="SE">Sergipe</option><option value="BA">Bahia</option></select></FormField>
                <FormField label="Rua *" className="field-wide"><input name="street" autoComplete="street-address" placeholder="Ex.: Rua Exemplo" required /></FormField>
                <FormField label="Número *"><input name="number" inputMode="numeric" placeholder="Ex.: 11243" required /></FormField>
                <FormField label="Complemento"><input name="complement" placeholder="Ex.: Ap. 110, Bloco A" /></FormField>
                <FormField label="Cidade *"><input name="city" autoComplete="address-level2" placeholder="Ex.: Maceió" required /></FormField>
                <FormField label="Bairro *"><input name="neighborhood" placeholder="Informe o bairro" required /></FormField>
              </div>
            </section>

            <section className="announce-card" id="property-features">
              <SectionHeading title="Tipo de imóvel e descrição" description="Conte aos interessados o que torna seu imóvel especial." />
              <div className="announce-fields-grid">
                <FormField label="Título do anúncio *" className="field-wide"><input name="listingTitle" maxLength="90" placeholder="Ex.: Apartamento próximo à UFAL" required /></FormField>
                <FormField label="Tipo de imóvel *"><select name="propertyType" defaultValue="" required><option value="" disabled>Selecione o tipo</option><option>Apartamento</option><option>Casa</option><option>Quarto</option><option>República</option></select></FormField>
                <FormField label="Quartos *"><select name="rooms" defaultValue="" required><option value="" disabled>Selecione</option>{[1, 2, 3, 4, 5, 6].map((number) => <option key={number}>{number}</option>)}</select></FormField>
                <FormField label="Banheiros *"><select name="bathrooms" defaultValue="" required><option value="" disabled>Selecione</option>{[1, 2, 3, 4, 5].map((number) => <option key={number}>{number}</option>)}</select></FormField>
                <FormField label="Vagas de garagem"><select name="parking" defaultValue=""><option value="">Selecione</option>{[0, 1, 2, 3, 4].map((number) => <option key={number}>{number}</option>)}</select></FormField>
                <FormField label="Descrição do imóvel *" className="field-wide"><textarea name="description" rows="4" maxLength="1000" placeholder="Conte sobre o imóvel, localização, diferenciais e regras do condomínio." required /><small>Até 1.000 caracteres</small></FormField>
              </div>
              <fieldset className="announce-amenities">
                <legend>Comodidades e diferenciais</legend>
                <div>{amenities.map((amenity) => <label className="announce-check" key={amenity}><input type="checkbox" name="amenities" value={amenity} /><span>{amenity}</span></label>)}</div>
              </fieldset>
              <FormField label="Regras e informações adicionais" className="field-wide"><textarea name="rules" rows="3" maxLength="500" placeholder="Ex.: horário de silêncio, uso das áreas comuns, regras da casa." /><small>Até 500 caracteres</small></FormField>
            </section>

            <section className="announce-card" id="property-photos">
              <SectionHeading title="Fotos e vídeo do imóvel" description="Imagens claras ajudam os interessados a conhecer melhor o espaço." />
              <label className="announce-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addPhotoFiles(event.dataTransfer.files); }}>
                <LineIcon name="homeGroup" size={34} />
                <strong>Adicione fotos do seu imóvel</strong>
                <span>Arraste as imagens aqui ou clique para selecionar.</span>
                <small>JPG, PNG ou WEBP · até 10 fotos</small>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} />
              </label>
              {photoPreviews.length > 0 && <div className="announce-photo-grid">{photoPreviews.map(({ file, url }, index) => <figure key={`${file.name}-${index}`}><img src={url} alt={`Prévia ${index + 1}: ${file.name}`} /><figcaption>{file.name}<button type="button" onClick={() => removePhoto(index)} aria-label={`Remover ${file.name}`}>×</button></figcaption></figure>)}</div>}
              <FormField label="Vídeo (opcional)" className="announce-video-field"><input type="file" accept="video/*" onChange={(event) => { setVideo(event.target.files?.[0] ?? null); setStatus(''); }} />{video && <small>{video.name}</small>}</FormField>
            </section>

            <section className="announce-card" id="property-publish">
              <SectionHeading title="Valor e contrato" description="Defina o valor mensal e as condições de locação." />
              <div className="announce-fields-grid">
                <FormField label="Valor do aluguel (R$) *"><input name="rent" type="number" min="1" step="0.01" inputMode="decimal" placeholder="Ex.: 500,00" required /></FormField>
                <FormField label="Condomínio (opcional)"><input name="condominium" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Ex.: 100,00" /></FormField>
                <FormField label="Tipo de contrato *"><select name="contractType" defaultValue="" required><option value="" disabled>Selecione</option><option>Aluguel mensal</option><option>Compartilhamento de imóvel</option><option>Temporada</option></select></FormField>
                <FormField label="Prazo mínimo de permanência *"><select name="minimumStay" defaultValue="" required><option value="" disabled>Selecione</option><option>Sem prazo mínimo</option><option>3 meses</option><option>6 meses</option><option>12 meses</option></select></FormField>
              </div>
            </section>

            <section className="announce-card announce-review" id="property-review">
              <SectionHeading title="Revisar e publicar" description="Confira as informações antes de concluir o cadastro." />
              <p>Seu imóvel será exibido para estudantes que buscam moradia na região após a análise do anúncio.</p>
              {status && <p className="announce-status" role="status">{status}</p>}
              <button className="announce-submit" type="submit">Publicar anúncio <span aria-hidden="true">→</span></button>
            </section>
          </form>

          {submittedListing && <div className="announce-submitted-content">
            <section className="announce-card announce-listing-summary">
              <SectionHeading title="Resumo do seu anúncio" />
              <div className="announce-listing-preview">
                {submittedListing.photos[0] ? <img src={submittedListing.photos[0].url} alt={`Foto do imóvel: ${submittedListing.listingTitle}`} /> : <div className="announce-listing-placeholder"><LineIcon name="homeGroup" size={42} /><span>Sem foto adicionada</span></div>}
                <div className="announce-listing-copy">
                  <h2>{submittedListing.listingTitle}</h2>
                  <p className="announce-listing-location">{[submittedListing.neighborhood, submittedListing.city, submittedListing.state].filter(Boolean).join(' - ')}</p>
                  <p className="announce-listing-type">{submittedListing.propertyType} <span>·</span> {submittedListing.rooms} {submittedListing.rooms === '1' ? 'quarto' : 'quartos'} <span>·</span> {submittedListing.bathrooms} {submittedListing.bathrooms === '1' ? 'banheiro' : 'banheiros'}</p>
                  <strong className="announce-listing-price">{Number(submittedListing.rent).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<small>/mês</small></strong>
                  <span className="announce-review-badge">Em análise</span>
                </div>
              </div>
              {submittedListing.photos.length > 1 && <div className="announce-submitted-photos" aria-label="Fotos enviadas">{submittedListing.photos.map(({ file, url }, index) => <img src={url} alt={`Foto ${index + 1} do imóvel: ${file.name}`} key={`${file.name}-${index}`} />)}</div>}
            </section>

            <section className="announce-card announce-listing-details">
              <SectionHeading title="Informações do imóvel" />
              <dl className="announce-detail-grid">
                <div><dt>Tipo de imóvel</dt><dd>{submittedListing.propertyType}</dd></div>
                <div><dt>Endereço</dt><dd>{[submittedListing.street, submittedListing.number, submittedListing.complement, submittedListing.neighborhood, submittedListing.city, submittedListing.state, submittedListing.cep].filter(Boolean).join(', ')}</dd></div>
                <div><dt>Quartos</dt><dd>{submittedListing.rooms}</dd></div>
                <div><dt>Banheiros</dt><dd>{submittedListing.bathrooms}</dd></div>
                <div><dt>Vagas de garagem</dt><dd>{submittedListing.parking || 'Não informado'}</dd></div>
                <div><dt>Comodidades</dt><dd>{submittedListing.amenities.length ? submittedListing.amenities.join(', ') : 'Nenhuma informada'}</dd></div>
                <div><dt>Aluguel</dt><dd>{Number(submittedListing.rent).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês</dd></div>
                <div><dt>Condomínio</dt><dd>{submittedListing.condominium ? `${Number(submittedListing.condominium).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês` : 'Não informado'}</dd></div>
                <div><dt>Tipo de contrato</dt><dd>{submittedListing.contractType}</dd></div>
                <div><dt>Prazo mínimo</dt><dd>{submittedListing.minimumStay}</dd></div>
                <div className="announce-detail-wide"><dt>Descrição</dt><dd>{submittedListing.description}</dd></div>
                {submittedListing.rules && <div className="announce-detail-wide"><dt>Regras e informações adicionais</dt><dd>{submittedListing.rules}</dd></div>}
                {submittedListing.videoName && <div><dt>Vídeo enviado</dt><dd>{submittedListing.videoName}</dd></div>}
              </dl>
            </section>

            <section className="announce-card announce-quick-actions">
              <SectionHeading title="Ações rápidas" />
              <button type="button" onClick={() => { setSubmittedListing(null); document.querySelector('.announce-main')?.scrollTo({ top: 0, behavior: 'smooth' }); }}><strong>Editar anúncio</strong><span>Altere informações, fotos ou valores.</span><LineIcon name="edit" size={20} /></button>
              <button type="button" onClick={startAnotherAnnouncement}><strong>Anunciar outro imóvel</strong><span>Comece um novo cadastro de imóvel.</span><LineIcon name="homeGroup" size={20} /></button>
            </section>
          </div>}
        </div>
      </main>
    </div>
  );
}
