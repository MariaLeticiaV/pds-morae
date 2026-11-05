import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { OwnerSidebar } from './OwnerDashboardPage.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineIcon as Icon } from '../components/LineIcon.jsx';
import { getDemoUser, saveDemoUser } from '../utils/demoUser.js';
import './MyProfilePage.css';

const initialProfile = {
  name: 'Ana Beatriz', gender: 'Feminino', cpf: '123.456.789-00', email: 'ana.beatriz@ufal.br', phone: '(82) 99999-9999', birthDate: '2004-05-18',
  course: 'Arquitetura e Urbanismo', period: '3º período', enrollment: 'Matrícula ativa', university: 'UFAL', campus: 'A. C. Simões', status: 'Em procura',
  housing: 'República ou apartamento compartilhado', location: 'Até 5 km do Campus A. C. Simões', amenities: 'Wi-Fi, mobiliado e cozinha compartilhada', budget: 'Até R$ 800,00',
  organization: 'Organizada', environment: 'Ambiente tranquilo', smoking: 'Não fumante', guests: 'Recebe visitas às vezes',
  about: 'Oi! Sou a Ana Beatriz, estudante de Arquitetura e Urbanismo. Sou uma pessoa organizada, tranquila e respeito muito o espaço e a rotina dos outros. Gosto de ambientes limpos, acolhedores e com boa convivência. Estou em busca de uma moradia próxima ao campus, com fácil acesso ao transporte e em um ambiente calmo para conciliar os estudos e a rotina.',
  photo: '',
};

function profileFromSignup(user) {
  if (!user) return initialProfile;
  const data = user.profile ?? {};
  const demoDefaults = {
    ...initialProfile, name: user.name, gender: '', cpf: '', email: '', phone: '', birthDate: '',
    course: '', period: '', enrollment: '', university: '', campus: '', status: '', housing: '', location: '', amenities: '', budget: '',
    organization: '', environment: '', smoking: '', guests: '', about: 'Adicione uma apresentação para que outras pessoas conheçam seu perfil.', photo: '',
  };
  const amenityValues = data.amenities ?? data.propertyAmenities ?? [];
  const budgetValue = data.budget || data.propertyRent || data.rent;
  return {
    ...demoDefaults,
    ...data,
    name: user.name,
    phone: data.phone || data.mobile || '',
    birthDate: data.birthDate || '',
    course: data.course || '',
    period: data.period || '',
    enrollment: data.enrollment || '',
    university: data.university || data.institution || '',
    campus: data.campus || '',
    status: data.status || (user.role === 'proprietario' ? 'Proprietário' : user.role === 'ofertante' ? 'Ofertando vaga' : 'Em procura'),
    housing: data.housing || data.housingType || data.propertyType || '',
    location: data.location || [data.preferredNeighborhoods, data.propertyNeighborhood, data.propertyCity, data.city, data.distance].filter(Boolean).join(' · '),
    amenities: Array.isArray(amenityValues) ? amenityValues.join(', ') : amenityValues,
    budget: data.budget || (budgetValue ? `R$ ${budgetValue}${/^\d/.test(String(budgetValue)) ? '/mês' : ''}` : ''),
    organization: data.organization || '',
    environment: data.environment || '',
    smoking: data.smoking || '',
    guests: data.guests || data.visitors || '',
    about: data.about || data.aboutMe || data.listingDescription || data.propertyDescription || demoDefaults.about,
    photo: data.photo || '',
  };
}

function loadProfile(user) {
  const storageKey = user ? `morae.profile.${user.role || 'estudante'}` : 'morae.profile.ana-beatriz';
  const baseProfile = profileFromSignup(user);
  try { return { ...baseProfile, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
  catch { return baseProfile; }
}

function Field({ label, value, icon, editing, onChange, type = 'text', options }) {
  return <label className="my-field"><span className="my-field-icon"><Icon name={icon} size={20} /></span><span className="my-field-copy"><span className="my-field-label">{label}</span>{editing ? options ? <select aria-label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input aria-label={label} type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /> : <span className="my-field-value">{type === 'date' && value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : value}</span>}</span></label>;
}

export function MyProfilePage() {
  const demoUser = getDemoUser();
  const profileStorageKey = `morae.profile.${demoUser?.role || 'estudante'}`;
  const [profile, setProfile] = useState(() => loadProfile(demoUser));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(() => window.location.hash.slice(1) || 'informacoes');
  const photoInput = useRef(null);
  const initials = useMemo(() => profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), [profile.name]);
  const roleLabel = demoUser?.role === 'proprietario' ? 'Proprietário' : demoUser?.role === 'ofertante' ? 'Aluno ofertador' : 'Estudante';

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;
    setActiveTab(sectionId);
    requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  function openProfileSection(event, sectionId) {
    event.preventDefault();
    setActiveTab(sectionId);
    window.history.pushState(null, '', `/perfil#${sectionId}`);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function update(key, value) { setDraft((current) => ({ ...current, [key]: value })); }
  function beginEdit() {
    setDraft(profile);
    setEditing(true);
    setMessage('Modo de edição ativado. Altere os campos e salve.');
    window.setTimeout(() => setMessage(''), 3500);
    requestAnimationFrame(() => document.getElementById('informacoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  function cancelEdit() { setDraft(profile); setEditing(false); setMessage(''); }
  function saveProfile(event) {
    event.preventDefault();
    setProfile(draft);
    localStorage.setItem(profileStorageKey, JSON.stringify(draft));
    if (demoUser) saveDemoUser(draft.name, demoUser.role, { ...demoUser.profile, ...draft });
    setEditing(false);
    setMessage('Perfil atualizado com sucesso.');
    window.setTimeout(() => setMessage(''), 3500);
  }
  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextProfile = { ...profile, photo: String(reader.result) };
      setProfile(nextProfile);
      setDraft(nextProfile);
      localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile));
      if (demoUser) saveDemoUser(nextProfile.name, demoUser.role, { ...demoUser.profile, ...nextProfile });
      setMessage('Foto de perfil atualizada.');
      window.setTimeout(() => setMessage(''), 3500);
    };
    reader.readAsDataURL(file);
  }
  const shown = editing ? draft : profile;

  return (
    <div className="user-profile-dashboard my-profile-dashboard">
      {demoUser?.role === 'proprietario' || demoUser?.role === 'ofertante' ? <OwnerSidebar pathname="/perfil" role={demoUser.role} /> : <DashboardSidebar active='profile' />}
      <main className="user-profile-main my-profile-main">
        <header className="dashboard-topbar profile-topbar">
          <label className="profile-search"><Icon name="search" size={21} /><input placeholder="Buscar por cidade, bairro, universidade..." aria-label="Buscar por cidade, bairro ou universidade" /></label>
          <div className="profile-top-actions"><button type="button" aria-label="Notificações"><Icon name="bell" size={21} /></button><Link to="/perfil" className="profile-greeting-link"><span className="profile-small-avatar">{(demoUser?.name || profile.name).charAt(0).toLocaleUpperCase('pt-BR')}</span><span>Olá, {demoUser?.name || profile.name}</span><span className="profile-top-chevron" /></Link></div>
        </header>
        <form className={`my-profile-content${editing ? ' is-editing' : ''}`} onSubmit={saveProfile}>
          <div className="my-profile-heading"><div><p className="my-profile-kicker">Minha conta</p><h1>Meu Perfil</h1></div>{editing ? <div className="my-profile-actions"><button type="button" className="my-cancel" onClick={cancelEdit}>Cancelar</button><button type="submit" className="my-save">Salvar alterações</button></div> : <button type="button" className="my-edit-button" onClick={beginEdit}><Icon name="edit" size={17} />Editar perfil</button>}</div>
          {message && <p className="my-profile-toast" role="status">{message}</p>}
          <section className="my-profile-hero">
            <div className="my-avatar-area">
              <button type="button" className="my-avatar" onClick={() => editing && photoInput.current?.click()} aria-label="Alterar foto de perfil" disabled={!editing}>{profile.photo ? <img src={profile.photo} alt="Foto de perfil" /> : <span>{initials}</span>}</button>
              {editing && <button type="button" className="my-camera-button" onClick={() => photoInput.current?.click()} aria-label="Enviar foto"><Icon name="camera" size={17} /></button>}
              <input ref={photoInput} className="my-photo-input" type="file" accept="image/*" onChange={choosePhoto} />
            </div>
            <div className="my-profile-identity"><h2>{profile.name}</h2><p><Icon name={roleLabel === 'Estudante' ? 'school' : 'homeGroup'} size={17} /> {roleLabel}{profile.university ? ` · ${profile.university}` : ''}</p><div className="my-profile-tags">{[profile.period, profile.course, profile.university || (roleLabel === 'Proprietário' ? 'Imóveis residenciais' : roleLabel === 'Aluno ofertador' ? 'Oferece vaga' : 'Moradia Estudantil')].filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
            <span className="my-hero-orbit my-orbit-green" /><span className="my-hero-orbit my-orbit-pink" />
          </section>
          <section className="my-profile-summary" aria-label="Resumo do perfil">
            <div><span className="my-summary-icon"><Icon name="school" /></span><span><small>Universidade</small><strong>{profile.university}</strong></span></div>
            <div><span className="my-summary-icon"><Icon name="pin" /></span><span><small>Campus</small><strong>{profile.campus}</strong></span></div>
            <div><span className="my-summary-icon my-status-icon" /><span><small>Status</small><strong>{profile.status}</strong></span></div>
            <div><span className="my-summary-icon"><Icon name="money" /></span><span><small>Valor máximo</small><strong>{profile.budget}</strong></span></div>
          </section>
          <nav className="my-profile-tabs" aria-label="Seções do perfil">
            <a className={activeTab === 'informacoes' ? 'active' : ''} href="#informacoes" onClick={(event) => openProfileSection(event, 'informacoes')}>Informações Pessoais</a><a className={activeTab === 'preferencias' ? 'active' : ''} href="#preferencias" onClick={(event) => openProfileSection(event, 'preferencias')}>Preferências de Moradia</a><a className={activeTab === 'habitos' ? 'active' : ''} href="#habitos" onClick={(event) => openProfileSection(event, 'habitos')}>Hábitos e Rotinas</a><a className={activeTab === 'apresentacao' ? 'active' : ''} href="#apresentacao" onClick={(event) => openProfileSection(event, 'apresentacao')}>Apresentação Pessoal</a><a className={activeTab === 'configuracoes' ? 'active' : ''} href="#configuracoes" onClick={(event) => openProfileSection(event, 'configuracoes')}>Configurações</a>
          </nav>
          <div className="my-profile-columns">
            <section className="my-profile-card my-personal-card" id="informacoes"><h2>Informações Pessoais</h2><div className="my-fields-grid">
              <Field label="Nome Completo" icon="person" value={shown.name} editing={editing} onChange={(value) => update('name', value)} />
              <Field label="Gênero" icon="person" value={shown.gender} editing={editing} onChange={(value) => update('gender', value)} options={['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar', 'Outro']} />
              <Field label="CPF" icon="person" value={shown.cpf} editing={editing} onChange={(value) => update('cpf', value)} />
              <Field label="E-mail" icon="mail" value={shown.email} editing={editing} onChange={(value) => update('email', value)} type="email" />
              <Field label="Telefone" icon="phone" value={shown.phone} editing={editing} onChange={(value) => update('phone', value)} type="tel" />
              <Field label="Data de Nascimento" icon="calendar" value={shown.birthDate} editing={editing} onChange={(value) => update('birthDate', value)} type="date" />
              <Field label="Curso" icon="school" value={shown.course} editing={editing} onChange={(value) => update('course', value)} />
              <Field label="Período" icon="calendar" value={shown.period} editing={editing} onChange={(value) => update('period', value)} />
              <Field label="Comprovação de Vínculo" icon="school" value={shown.enrollment} editing={editing} onChange={(value) => update('enrollment', value)} options={['Matrícula ativa', 'Aguardando comprovação', 'Não informado']} />
              <Field label="Universidade" icon="school" value={shown.university} editing={editing} onChange={(value) => update('university', value)} />
              <Field label="Campus" icon="pin" value={shown.campus} editing={editing} onChange={(value) => update('campus', value)} />
              <Field label="Status da moradia" icon="home" value={shown.status} editing={editing} onChange={(value) => update('status', value)} options={['Em procura', 'Já encontrei moradia', 'Ainda decidindo']} />
            </div></section>
            <section className="my-profile-card my-security-card" id="configuracoes"><h2><Icon name="shield" size={27} />Segurança da Conta</h2><div className="my-verified-row"><span>✓</span><div><strong>E-mail verificado</strong><small>{profile.email}</small></div></div><div className="my-verified-row"><span>✓</span><div><strong>Telefone verificado</strong><small>{profile.phone}</small></div></div><button type="button" className="my-password-button" onClick={() => setMessage('A alteração de senha ficará disponível quando a autenticação estiver conectada.')}>🔒 <span><strong>Deseja alterar sua senha?</strong><small>Mantenha sua conta sempre segura.</small></span></button></section>
          </div>
          <section className="my-profile-card my-preferences-card" id="preferencias"><h2>Preferências de Moradia</h2><div className="my-preferences-grid">
            <Field label="Tipo de Moradia" icon="homeGroup" value={shown.housing} editing={editing} onChange={(value) => update('housing', value)} options={['República ou apartamento compartilhado', 'Apartamento compartilhado', 'República', 'Kitnet', 'Quarto individual', 'Casa', 'Apartamento', 'Quarto']} />
            <Field label="Localização" icon="pin" value={shown.location} editing={editing} onChange={(value) => update('location', value)} />
            <Field label="Comodidades" icon="home" value={shown.amenities} editing={editing} onChange={(value) => update('amenities', value)} />
            <Field label="Valor Máximo" icon="money" value={shown.budget} editing={editing} onChange={(value) => update('budget', value)} />
          </div></section>
          <section className="my-profile-card my-habits-card" id="habitos"><h2>Hábitos e Rotina</h2><div className="my-habits-grid">
            <Field label="Organização" icon="person" value={shown.organization} editing={editing} onChange={(value) => update('organization', value)} options={['Organizada', 'Muito organizada', 'Flexível', 'Mais ou menos', 'Estou melhorando']} />
            <Field label="Ambiente" icon="home" value={shown.environment} editing={editing} onChange={(value) => update('environment', value)} options={['Ambiente tranquilo', 'Ambiente sociável', 'Sem preferência', 'Silenciosos', 'Movimentados', 'Indiferente']} />
            <Field label="Tabagismo" icon="person" value={shown.smoking} editing={editing} onChange={(value) => update('smoking', value)} options={['Não fumante', 'Fumante', 'Prefiro não informar', 'Sim', 'Às vezes', 'Não']} />
            <Field label="Visitas" icon="person" value={shown.guests} editing={editing} onChange={(value) => update('guests', value)} options={['Recebe visitas às vezes', 'Recebe visitas frequentemente', 'Prefere não receber visitas', 'Raramente', 'Às vezes', 'Frequentemente']} />
          </div></section>
          <section className="my-profile-card my-about-card" id="apresentacao"><h2>Apresentação Pessoal</h2>{editing ? <label className="my-about-editor"><span>Conte um pouco sobre você</span><textarea rows="5" value={shown.about} onChange={(event) => update('about', event.target.value)} /></label> : <p>{profile.about}</p>}</section>
        </form>
      </main>
    </div>
  );
}
