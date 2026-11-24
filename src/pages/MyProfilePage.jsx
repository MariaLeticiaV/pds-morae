import { DashboardSidebar } from '../components/DashboardSidebar.jsx';
import { AccountMenu } from '../components/AccountMenu.jsx';
import { OwnerSidebar } from './OwnerDashboardPage.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LineIcon as Icon } from '../components/LineIcon.jsx';
import { getDemoUser, saveDemoUser } from '../utils/demoUser.js';
import { getAccessToken, getMyAccount, getMyProfile, updateMyAccount, updateMyProfile } from '../services/api.js';
import { formatBudget, optionLabels, parseBudget, toCode, toLabel } from '../services/profileOptions.js';
import { getUserSession, saveUserSession } from '../services/userAuth.js';
import './MyProfilePage.css';


const initialProfile = {
  name: '', gender: '', cpf: '', email: '', phone: '', birthDate: '', course: '', period: '', enrollment: '', university: '', campus: '', status: '', housing: '', location: '', amenities: '', budget: '', organization: '', environment: '', smoking: '', guests: '', about: '', photo: '',
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
    about: data.about || data.aboutMe || data.listingDescription || data.propertyDescription || '',
    photo: data.photo || '',
  };
}

function loadProfile(user, hasSession) {
  const baseProfile = profileFromSignup(user);
  // Com login os dados vêm da API; o armazenamento do navegador é só do modo demonstração
  // (ele é por tipo de conta, então misturaria dados de pessoas diferentes).
  if (hasSession) return baseProfile;
  const storageKey = user ? `morae.profile.${user.role || 'estudante'}` : 'morae.profile.ana-beatriz';
  try { return { ...baseProfile, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
  catch { return baseProfile; }
}

const EMPTY_ABOUT = 'Adicione uma apresentação para que outras pessoas conheçam seu perfil.';
const enrollmentLabels = { VERIFIED: 'Matrícula ativa', PENDING: 'Aguardando comprovação', REJECTED: 'Comprovação recusada' };

// Converte GET /users/me/profile para os campos exibidos na página.
function profileFromApi(view) {
  const student = view.student;
  const prefs = view.housingPreferences ?? {};
  const answers = student?.compatibilityAnswers;
  return {
    name: view.name,
    email: view.private?.email ?? '',
    phone: view.private?.phone ?? '',
    gender: toLabel('gender', view.private?.gender),
    birthDate: view.private?.birthDate ?? '',
    course: student?.course ?? '',
    period: student ? `${student.period}º período` : '',
    enrollment: student ? enrollmentLabels[student.verificationStatus] ?? '' : '',
    university: student?.university ?? '',
    campus: student?.campus ?? '',
    city: view.city ?? '',
    housing: toLabel('housingType', prefs.housingType),
    preferredNeighborhoods: prefs.preferredNeighborhoods ?? '',
    distance: toLabel('campusDistance', prefs.campusDistance),
    budget: formatBudget(prefs.maxBudget),
    organization: toLabel('organization', answers?.organization),
    environment: toLabel('environment', answers?.environment),
    smoking: toLabel('smoking', answers?.smoking),
    guests: toLabel('visitors', answers?.visitors),
    about: view.bio || EMPTY_ABOUT,
    ...(view.photoUrl ? { photo: view.photoUrl } : {}),
  };
}

// Monta o corpo de PATCH /users/me/profile só com o que mudou.
function profileChanges(before, draft, view) {
  const changed = (key) => String(draft[key] ?? '').trim() !== String(before[key] ?? '').trim();
  const clean = (key) => String(draft[key] ?? '').trim() || null;
  const details = {};
  if (changed('gender')) details.gender = toCode('gender', draft.gender);
  if (changed('birthDate')) details.birthDate = clean('birthDate');
  if (changed('about')) details.bio = draft.about.trim() === EMPTY_ABOUT ? null : clean('about');

  const body = {};
  if (view.student) {
    if (changed('university')) details.university = clean('university');
    if (changed('campus')) details.campus = clean('campus');
    if (changed('housing')) details.housingType = toCode('housingType', draft.housing);
    if (changed('preferredNeighborhoods')) details.preferredNeighborhoods = clean('preferredNeighborhoods');
    if (changed('distance')) details.campusDistance = toCode('campusDistance', draft.distance);
    if (changed('budget')) details.maxBudget = parseBudget(draft.budget);
    if (changed('course')) body.course = clean('course');
    if (changed('period')) {
      const period = Number.parseInt(String(draft.period).replace(/\D/g, ''), 10);
      if (Number.isFinite(period)) body.period = period;
    }
    const answers = view.student.compatibilityAnswers;
    const habitFields = { organization: 'organization', environment: 'environment', smoking: 'smoking', guests: 'visitors' };
    if (answers && Object.keys(habitFields).some(changed)) {
      body.compatibilityAnswers = { ...answers };
      for (const [key, field] of Object.entries(habitFields)) {
        const code = toCode(field, draft[key]);
        if (code) body.compatibilityAnswers[field] = code;
      }
    }
  }
  if (Object.keys(details).length) body.details = details;
  return body;
}

function Field({ label, value, icon, editing, onChange, type = 'text', options }) {
  return <label className="my-field"><span className="my-field-icon"><Icon name={icon} size={20} /></span><span className="my-field-copy"><span className="my-field-label">{label}</span>{editing ? options ? <select aria-label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input aria-label={label} type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /> : <span className="my-field-value">{type === 'date' && value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : value}</span>}</span></label>;
}

export function MyProfilePage() {
  const demoUser = getDemoUser();
  const profileStorageKey = `morae.profile.${demoUser?.role || 'estudante'}`;
  const [profile, setProfile] = useState(() => loadProfile(demoUser, Boolean(getAccessToken() && getUserSession())));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(() => window.location.hash.slice(1) || 'informacoes');
  const photoInput = useRef(null);
  // Nome, e-mail e telefone vêm da API quando há sessão; os demais campos
  // ainda não existem no backend e continuam salvos só neste navegador.
  const isAuthenticated = Boolean(getAccessToken() && getUserSession());
  const [account, setAccount] = useState(null);
  const [apiProfile, setApiProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const isStudentAccount = apiProfile
    ? Boolean(apiProfile.student)
    : ['estudante', 'ofertante'].includes(demoUser?.role);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    getMyAccount()
      .then((data) => {
        if (cancelled) return;
        setAccount(data);
        const merge = (current) => ({ ...current, name: data.name, email: data.email, phone: data.phone ?? '', ...(data.photoUrl ? { photo: data.photoUrl } : {}) });
        setProfile(merge);
        setDraft(merge);
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message || 'Não foi possível carregar os dados da sua conta.');
      });
    getMyProfile()
      .then((view) => {
        if (cancelled) return;
        setApiProfile(view);
        const merge = (current) => ({ ...current, ...profileFromApi(view) });
        setProfile(merge);
        setDraft(merge);
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message || 'Não foi possível carregar os dados do seu perfil.');
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);
  const initials = useMemo(() => profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), [profile.name]);
  const roleLabel = demoUser?.role === 'proprietario' ? 'Proprietário' : demoUser?.role === 'ofertante' ? 'Aluno ofertador' : demoUser?.role === 'administrador' ? 'Administrador' : isStudentAccount ? 'Estudante' : 'Usuário';

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
  async function saveProfile(event) {
    event.preventDefault();
    let saved = draft;
    let emailChanged = false;
    if (isAuthenticated && account) {
      const changes = {};
      if (draft.name.trim() !== account.name) changes.name = draft.name.trim();
      if (draft.email.trim() !== account.email) changes.email = draft.email.trim();
      if ((draft.phone || '').trim() !== (account.phone || '')) changes.phone = (draft.phone || '').trim() || null;
      if (draft.cpf.trim() && draft.cpf !== profile.cpf) changes.cpf = draft.cpf.trim();
      if (Object.keys(changes).length) {
        setSaving(true);
        try {
          const updated = await updateMyAccount(changes);
          emailChanged = updated.email !== account.email;
          setAccount(updated);
          saved = { ...draft, name: updated.name, email: updated.email, phone: updated.phone ?? '' };
          const session = getUserSession();
          if (session) saveUserSession({ ...session, name: updated.name, email: updated.email });
        } catch (error) {
          setMessage(error.message || 'Não foi possível salvar os dados da conta.');
          return;
        } finally {
          setSaving(false);
        }
      }
    }
    if (isAuthenticated && apiProfile) {
      const body = profileChanges(profileFromApi(apiProfile), draft, apiProfile);
      if (Object.keys(body).length) {
        setSaving(true);
        try {
          const updated = await updateMyProfile(body);
          setApiProfile(updated);
          saved = { ...saved, ...profileFromApi(updated), name: saved.name, email: saved.email, phone: saved.phone };
        } catch (error) {
          setMessage(error.message || 'Não foi possível salvar os dados do perfil.');
          return;
        } finally {
          setSaving(false);
        }
      }
    }
    setProfile(saved);
    setDraft(saved);
    if (!isAuthenticated) {
      localStorage.setItem(profileStorageKey, JSON.stringify(saved));
      if (demoUser) saveDemoUser(saved.name, demoUser.role, { ...demoUser.profile, ...saved });
    }
    setEditing(false);
    setMessage(emailChanged
      ? 'Perfil atualizado. Enviamos um link de confirmação para o novo e-mail; confirme-o antes do próximo login.'
      : 'Perfil atualizado com sucesso.');
    window.setTimeout(() => setMessage(''), emailChanged ? 8000 : 3500);
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
          <div className="profile-top-actions"><button type="button" aria-label="Notificações"><Icon name="bell" size={21} /></button><AccountMenu className="profile-greeting-link"><span className="profile-small-avatar">{(demoUser?.name || profile.name).charAt(0).toLocaleUpperCase('pt-BR')}</span><span>Olá, {demoUser?.name || profile.name}</span><span className="profile-top-chevron" /></AccountMenu></div>
        </header>
        <form className={`my-profile-content${editing ? ' is-editing' : ''}`} onSubmit={saveProfile}>
          <div className="my-profile-heading"><div><p className="my-profile-kicker">Minha conta</p><h1>Meu Perfil</h1></div>{editing ? <div className="my-profile-actions"><button type="button" className="my-cancel" onClick={cancelEdit}>Cancelar</button><button type="submit" className="my-save" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button></div> : <button type="button" className="my-edit-button" onClick={beginEdit}><Icon name="edit" size={17} />Editar perfil</button>}</div>
          {message && <p className="my-profile-toast" role="status">{message}</p>}
          <section className="my-profile-hero">
            <div className="my-avatar-area">
              <button type="button" className="my-avatar" onClick={() => editing && photoInput.current?.click()} aria-label="Alterar foto de perfil" disabled={!editing}>{profile.photo ? <img src={profile.photo} alt="Foto de perfil" /> : <span>{initials}</span>}</button>
              {editing && <button type="button" className="my-camera-button" onClick={() => photoInput.current?.click()} aria-label="Enviar foto"><Icon name="camera" size={17} /></button>}
              <input ref={photoInput} className="my-photo-input" type="file" accept="image/*" onChange={choosePhoto} />
            </div>
            <div className="my-profile-identity"><h2>{profile.name}</h2><p><Icon name={isStudentAccount ? 'school' : 'homeGroup'} size={17} /> {roleLabel}{isStudentAccount && profile.university ? ` · ${profile.university}` : ''}</p>{isStudentAccount && <div className="my-profile-tags">{[profile.period, profile.course, profile.university, roleLabel === 'Aluno ofertador' ? 'Oferece vaga' : 'Moradia Estudantil'].filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div>}</div>
            <span className="my-hero-orbit my-orbit-green" /><span className="my-hero-orbit my-orbit-pink" />
          </section>
          {isStudentAccount && <section className="my-profile-summary" aria-label="Resumo do perfil">
            <div><span className="my-summary-icon"><Icon name="school" /></span><span><small>Universidade</small><strong>{profile.university}</strong></span></div>
            <div><span className="my-summary-icon"><Icon name="pin" /></span><span><small>Campus</small><strong>{profile.campus}</strong></span></div>
            <div><span className="my-summary-icon my-status-icon" /><span><small>Status</small><strong>{profile.status}</strong></span></div>
            <div><span className="my-summary-icon"><Icon name="money" /></span><span><small>Valor máximo</small><strong>{profile.budget}</strong></span></div>
          </section>}
          <nav className="my-profile-tabs" aria-label="Seções do perfil">
            <a className={activeTab === 'informacoes' ? 'active' : ''} href="#informacoes" onClick={(event) => openProfileSection(event, 'informacoes')}>Informações Pessoais</a>{isStudentAccount && <><a className={activeTab === 'preferencias' ? 'active' : ''} href="#preferencias" onClick={(event) => openProfileSection(event, 'preferencias')}>Preferências de Moradia</a><a className={activeTab === 'habitos' ? 'active' : ''} href="#habitos" onClick={(event) => openProfileSection(event, 'habitos')}>Hábitos e Rotinas</a></>}<a className={activeTab === 'apresentacao' ? 'active' : ''} href="#apresentacao" onClick={(event) => openProfileSection(event, 'apresentacao')}>Apresentação Pessoal</a><a className={activeTab === 'configuracoes' ? 'active' : ''} href="#configuracoes" onClick={(event) => openProfileSection(event, 'configuracoes')}>Configurações</a>
          </nav>
          <div className="my-profile-columns">
            <section className="my-profile-card my-personal-card" id="informacoes"><h2>Informações Pessoais</h2><div className="my-fields-grid">
              <Field label="Nome Completo" icon="person" value={shown.name} editing={editing} onChange={(value) => update('name', value)} />
              <Field label="Gênero" icon="person" value={shown.gender} editing={editing} onChange={(value) => update('gender', value)} options={isAuthenticated ? ['', ...optionLabels('gender')] : ['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar', 'Outro']} />
              <Field label="CPF" icon="person" value={shown.cpf} editing={editing} onChange={(value) => update('cpf', value)} />
              <Field label="E-mail" icon="mail" value={shown.email} editing={editing} onChange={(value) => update('email', value)} type="email" />
              <Field label="Telefone" icon="phone" value={shown.phone} editing={editing} onChange={(value) => update('phone', value)} type="tel" />
              <Field label="Data de Nascimento" icon="calendar" value={shown.birthDate} editing={editing} onChange={(value) => update('birthDate', value)} type="date" />
              {isStudentAccount && <>
                <Field label="Curso" icon="school" value={shown.course} editing={editing} onChange={(value) => update('course', value)} />
                <Field label="Período" icon="calendar" value={shown.period} editing={editing} onChange={(value) => update('period', value)} />
                <Field label="Comprovação de Vínculo" icon="school" value={shown.enrollment} editing={editing && !isAuthenticated} onChange={(value) => update('enrollment', value)} options={['Matrícula ativa', 'Aguardando comprovação', 'Não informado']} />
                <Field label="Universidade" icon="school" value={shown.university} editing={editing} onChange={(value) => update('university', value)} />
                <Field label="Campus" icon="pin" value={shown.campus} editing={editing} onChange={(value) => update('campus', value)} />
                <Field label="Status da moradia" icon="home" value={shown.status} editing={editing} onChange={(value) => update('status', value)} options={['Em procura', 'Já encontrei moradia', 'Ainda decidindo']} />
              </>}
            </div></section>
            <section className="my-profile-card my-security-card" id="configuracoes"><h2><Icon name="shield" size={27} />Segurança da Conta</h2><div className="my-verified-row"><span>{account && !account.emailVerified ? '!' : '✓'}</span><div><strong>{account && !account.emailVerified ? 'E-mail aguardando confirmação' : 'E-mail verificado'}</strong><small>{profile.email}</small></div></div><div className="my-verified-row"><span>✓</span><div><strong>Telefone verificado</strong><small>{profile.phone}</small></div></div><button type="button" className="my-password-button" onClick={() => setMessage('A alteração de senha ficará disponível quando a autenticação estiver conectada.')}>🔒 <span><strong>Deseja alterar sua senha?</strong><small>Mantenha sua conta sempre segura.</small></span></button></section>
          </div>
          {isStudentAccount && <section className="my-profile-card my-preferences-card" id="preferencias"><h2>Preferências de Moradia</h2><div className="my-preferences-grid">
            <Field label="Tipo de Moradia" icon="homeGroup" value={shown.housing} editing={editing} onChange={(value) => update('housing', value)} options={isStudentAccount ? ['', ...optionLabels('housingType')] : ['República ou apartamento compartilhado', 'Apartamento compartilhado', 'República', 'Kitnet', 'Quarto individual', 'Casa', 'Apartamento', 'Quarto']} />
            {isStudentAccount ? <>
              <Field label="Bairros de interesse" icon="pin" value={shown.preferredNeighborhoods} editing={editing} onChange={(value) => update('preferredNeighborhoods', value)} />
              <Field label="Distância do campus" icon="pin" value={shown.distance} editing={editing} onChange={(value) => update('distance', value)} options={['', ...optionLabels('campusDistance')]} />
            </> : <>
              <Field label="Localização" icon="pin" value={shown.location} editing={editing} onChange={(value) => update('location', value)} />
              <Field label="Comodidades" icon="home" value={shown.amenities} editing={editing} onChange={(value) => update('amenities', value)} />
            </>}
            <Field label="Valor Máximo" icon="money" value={shown.budget} editing={editing} onChange={(value) => update('budget', value)} />
          </div></section>}
          {isStudentAccount && <section className="my-profile-card my-habits-card" id="habitos"><h2>Hábitos e Rotina</h2><div className="my-habits-grid">
            <Field label="Organização" icon="person" value={shown.organization} editing={editing} onChange={(value) => update('organization', value)} options={isStudentAccount ? optionLabels('organization') : ['Organizada', 'Muito organizada', 'Flexível', 'Mais ou menos', 'Estou melhorando']} />
            <Field label="Ambiente" icon="home" value={shown.environment} editing={editing} onChange={(value) => update('environment', value)} options={isStudentAccount ? optionLabels('environment') : ['Ambiente tranquilo', 'Ambiente sociável', 'Sem preferência', 'Silenciosos', 'Movimentados', 'Indiferente']} />
            <Field label="Tabagismo" icon="person" value={shown.smoking} editing={editing} onChange={(value) => update('smoking', value)} options={isStudentAccount ? optionLabels('smoking') : ['Não fumante', 'Fumante', 'Prefiro não informar', 'Sim', 'Às vezes', 'Não']} />
            <Field label="Visitas" icon="person" value={shown.guests} editing={editing} onChange={(value) => update('guests', value)} options={isStudentAccount ? optionLabels('visitors') : ['Recebe visitas às vezes', 'Recebe visitas frequentemente', 'Prefere não receber visitas', 'Raramente', 'Às vezes', 'Frequentemente']} />
          </div></section>}
          <section className="my-profile-card my-about-card" id="apresentacao"><h2>Apresentação Pessoal</h2>{editing ? <label className="my-about-editor"><span>Conte um pouco sobre você</span><textarea rows="5" value={shown.about} onChange={(event) => update('about', event.target.value)} /></label> : <p>{profile.about}</p>}</section>
        </form>
      </main>
    </div>
  );
}
