import { useRef, useState } from 'react';
import './SignupPage.css';

const profiles = [
  { id: 'estudante', icon: '🎓', title: 'Quero buscar minha vaga', description: 'Sou estudante buscando uma vaga ou imóvel.', tone: 'student', steps: ['Dados pessoais', 'Perfil de convivência', 'Preferências'] },
  { id: 'ofertante', icon: '🏡', title: 'Ofertar vaga em casa', description: 'Sou estudante e tenho uma vaga disponível.', tone: 'host', steps: ['Dados pessoais', 'Perfil de convivência', 'Dados da vaga'] },
  { id: 'proprietario', icon: '🔑', title: 'Sou proprietário', description: 'Quero anunciar meu imóvel.', tone: 'owner', steps: ['Dados pessoais', 'Dados do imóvel', 'Documentos'] },
];

const accommodationTypes = ['República', 'Quarto', 'Apartamento', 'Casa', 'Kitnet'];
const amenities = ['Wi-Fi', 'Ar-condicionado', 'Estacionamento', 'Mobiliada', 'Área de lazer', 'Permite pets', 'Cozinha equipada', 'Lavanderia'];
const studentProfileOptions = ['Tranquilo', 'Social', 'Aventureiro', 'Estudioso'];

function Field({ label, name, type = 'text', required = false, placeholder = '', value, onChange, ...props }) {
  return <label className="signup-field"><span>{label}{required && <b> *</b>}</span><input name={name} type={type} required={required} placeholder={placeholder} value={type === 'file' ? undefined : value ?? ''} onChange={onChange} {...props} /></label>;
}

function SelectField({ label, name, options, required = false, value, onChange }) {
  return <label className="signup-field"><span>{label}{required && <b> *</b>}</span><select name={name} required={required} value={value ?? ''} onChange={onChange}><option value="">Selecione</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function TextAreaField({ label, name, placeholder, value, onChange, maxLength }) {
  return <label className="signup-field signup-field-wide"><span>{label}</span><textarea name={name} placeholder={placeholder} value={value ?? ''} maxLength={maxLength} onChange={onChange} rows="3" /></label>;
}

function CheckGroup({ label, name, options, values = [], onToggle }) {
  return <fieldset className="signup-field signup-check-group"><legend>{label}</legend><div className="signup-check-options">{options.map((option) => <label key={option}><input type="checkbox" checked={values.includes(option)} onChange={() => onToggle(name, option)} />{option}</label>)}</div></fieldset>;
}

function UploadField({ label, name, accept = 'image/*,.pdf', required = false, answers, onChange, multiple = false }) {
  const selected = answers[name];
  const fileNames = Array.isArray(selected) ? selected.map((file) => file.name).join(', ') : selected?.name;
  return <label className="signup-field signup-upload"><span>{label}{required && <b> *</b>}</span><span className="signup-upload-control"><input name={name} type="file" accept={accept} required={required} multiple={multiple} onChange={onChange} /><small>{fileNames || 'Clique para selecionar arquivo (JPG, PNG ou PDF)'}</small></span></label>;
}

function Progress({ steps, activeStep }) {
  return <ol className="signup-progress" aria-label="Progresso do cadastro">{steps.map((step, index) => <li className={index + 1 === activeStep ? 'current' : index + 1 < activeStep ? 'complete' : ''} key={step}><span>{index + 1}</span><small>{step}</small></li>)}</ol>;
}

export function SignupPage() {
  const pageRef = useRef(null);
  const [profileId, setProfileId] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const activeProfile = profiles.find(({ id }) => id === profileId);

  function updateAnswer(event) {
    const { name, type, value, files } = event.target;
    setAnswers((current) => ({ ...current, [name]: type === 'file' ? (event.target.multiple ? [...files] : files[0]) : value }));
  }

  function toggleOption(name, option) {
    setAnswers((current) => {
      const selected = current[name] ?? [];
      return { ...current, [name]: selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option] };
    });
  }

  function chooseProfile(id) {
    setProfileId(id);
    setActiveStep(1);
    setAnswers({});
    setCompleted(false);
  }

  function submitStep(event) {
    event.preventDefault();
    if (activeStep < activeProfile.steps.length) setActiveStep((step) => step + 1);
    else setCompleted(true);
    pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStudentData() {
    return <>
      <div className="signup-form-grid">
        <Field label="Nome completo" name="fullName" required value={answers.fullName} onChange={updateAnswer} />
        <Field label="CPF" name="cpf" required placeholder="000.000.000-00" value={answers.cpf} onChange={updateAnswer} />
        <Field label="Data de nascimento" name="birthDate" type="date" required value={answers.birthDate} onChange={updateAnswer} />
        <SelectField label="País" name="country" options={['Brasil', 'Outro']} required value={answers.country} onChange={updateAnswer} />
        <SelectField label="Estado" name="state" options={['Alagoas', 'Pernambuco', 'Sergipe', 'Outro']} required value={answers.state} onChange={updateAnswer} />
        <Field label="Cidade" name="city" required value={answers.city} onChange={updateAnswer} />
        <Field label="Universidade ou instituição" name="university" required value={answers.university} onChange={updateAnswer} />
        <Field label="Campus" name="campus" required value={answers.campus} onChange={updateAnswer} />
        <Field label="Curso" name="course" required value={answers.course} onChange={updateAnswer} />
        <Field label="Período" name="period" value={answers.period} onChange={updateAnswer} />
        <Field label="Matrícula" name="enrollment" required value={answers.enrollment} onChange={updateAnswer} />
        <UploadField label="Comprovação de vínculo" name="enrollmentProof" required answers={answers} onChange={updateAnswer} />
      </div>
      <p className="signup-privacy">Seus dados estão seguros. Usaremos essas informações apenas para cadastro e validação na plataforma.</p>
    </>;
  }

  function renderOwnerData() {
    return <>
      <div className="signup-form-grid">
        <Field label="Nome completo" name="fullName" required value={answers.fullName} onChange={updateAnswer} />
        <Field label="E-mail" name="email" type="email" required value={answers.email} onChange={updateAnswer} />
        <Field label="CPF" name="cpf" required placeholder="000.000.000-00" value={answers.cpf} onChange={updateAnswer} />
        <Field label="Celular" name="phone" type="tel" required placeholder="(00) 00000-0000" value={answers.phone} onChange={updateAnswer} />
        <Field label="Data de nascimento" name="birthDate" type="date" required value={answers.birthDate} onChange={updateAnswer} />
        <SelectField label="Gênero" name="gender" options={['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar']} required value={answers.gender} onChange={updateAnswer} />
        <Field label="CEP" name="zip" required placeholder="00000-000" value={answers.zip} onChange={updateAnswer} />
        <Field label="Endereço" name="address" required placeholder="Rua, avenida e número" value={answers.address} onChange={updateAnswer} />
        <Field label="Cidade" name="city" required value={answers.city} onChange={updateAnswer} />
        <SelectField label="Estado" name="state" options={['Alagoas', 'Pernambuco', 'Sergipe', 'Outro']} required value={answers.state} onChange={updateAnswer} />
        <Field label="Bairro" name="neighborhood" required value={answers.neighborhood} onChange={updateAnswer} />
      </div>
      <p className="signup-privacy">Seus dados estão seguros. Usaremos essas informações apenas para cadastro e validação na plataforma.</p>
    </>;
  }

  function renderConviviality() {
    return <>
      <p className="signup-step-intro">Conte um pouco sobre seus hábitos e sua rotina. Isso ajuda a encontrar pessoas que combinam com você.</p>
      <div className="signup-form-grid">
        <SelectField label="Que horas costuma dormir?" name="sleepTime" options={['Antes das 21h', '21h–23h', '23h–01h', 'Depois da 01h']} value={answers.sleepTime} onChange={updateAnswer} />
        <SelectField label="Estuda em casa?" name="studyAtHome" options={['Sim', 'Às vezes', 'Não']} value={answers.studyAtHome} onChange={updateAnswer} />
        <SelectField label="Nível de organização" name="organization" options={['Muito organizado', 'Mais ou menos', 'Estou melhorando']} value={answers.organization} onChange={updateAnswer} />
        <SelectField label="Costuma receber visitas?" name="visitors" options={['Raramente', 'Às vezes', 'Frequentemente']} value={answers.visitors} onChange={updateAnswer} />
        <SelectField label="Você fuma?" name="smoking" options={['Sim', 'Às vezes', 'Não']} value={answers.smoking} onChange={updateAnswer} />
        <SelectField label="Possui animais de estimação?" name="pets" options={['Sim', 'Não']} value={answers.pets} onChange={updateAnswer} />
        <SelectField label="Rotina de limpeza" name="cleaning" options={['Diária', 'Semanal', 'Flexível']} value={answers.cleaning} onChange={updateAnswer} />
        <SelectField label="Prefere ambientes" name="environment" options={['Silenciosos', 'Movimentados', 'Indiferente']} value={answers.environment} onChange={updateAnswer} />
        <CheckGroup label="Como você se define?" name="lifestyle" options={studentProfileOptions} values={answers.lifestyle} onToggle={toggleOption} />
        <TextAreaField label="Apresentação pessoal (opcional)" name="aboutMe" placeholder="Conte um pouco sobre você, sua rotina e seus interesses..." value={answers.aboutMe} onChange={updateAnswer} />
      </div>
    </>;
  }

  function renderPreferences() {
    return <>
      <p className="signup-step-intro">Agora, informe o que você busca. Essas preferências ajudam a encontrar moradias que combinam com seu perfil.</p>
      <div className="signup-form-grid">
        <SelectField label="Tipo de moradia" name="housingType" options={accommodationTypes} required value={answers.housingType} onChange={updateAnswer} />
        <SelectField label="Faixa de orçamento mensal" name="budget" options={['Até R$ 500', 'R$ 500 a R$ 850', 'R$ 850 a R$ 1.200', 'Acima de R$ 1.200']} required value={answers.budget} onChange={updateAnswer} />
        <SelectField label="Distância do campus" name="distance" options={['Até 1 km', '1 a 3 km', '3 a 5 km', 'Não importa']} value={answers.distance} onChange={updateAnswer} />
        <Field label="Bairros de interesse" name="preferredNeighborhoods" placeholder="Ex.: Farol, Centro" value={answers.preferredNeighborhoods} onChange={updateAnswer} />
        <SelectField label="Número de moradores" name="roommates" options={['Moro sozinho', '1 a 2', '3 a 4', '5 ou mais']} value={answers.roommates} onChange={updateAnswer} />
        <SelectField label="Preferência de gênero dos moradores" name="roommateGender" options={['Indiferente', 'Feminino', 'Masculino']} value={answers.roommateGender} onChange={updateAnswer} />
        <TextAreaField label="Apresentação pessoal (opcional)" name="aboutMe" placeholder="Fale sobre sua rotina, hábitos e o que procura em uma moradia..." value={answers.aboutMe} onChange={updateAnswer} />
      </div>
    </>;
  }

  function renderHostListing() {
    return <>
      <p className="signup-step-intro">Conte um pouco sobre a vaga disponível. Fotos e informações detalhadas ajudam a encontrar estudantes compatíveis.</p>
      <div className="signup-form-grid">
        <SelectField label="Tipo de moradia" name="housingType" options={['Casa', 'Apartamento', 'República', 'Kitnet']} required value={answers.housingType} onChange={updateAnswer} />
        <Field label="Endereço" name="propertyAddress" required placeholder="Rua, número, bairro e cidade" value={answers.propertyAddress} onChange={updateAnswer} />
        <Field label="Quartos disponíveis" name="rooms" type="number" min="1" required value={answers.rooms} onChange={updateAnswer} />
        <Field label="Vagas disponíveis" name="vacancies" type="number" min="1" required value={answers.vacancies} onChange={updateAnswer} />
        <Field label="Valor do aluguel (R$)" name="rent" type="number" min="0" required value={answers.rent} onChange={updateAnswer} />
        <Field label="Despesas mensais aproximadas (R$)" name="expenses" type="number" min="0" required value={answers.expenses} onChange={updateAnswer} />
        <Field label="Distância do campus" name="campusDistance" placeholder="Ex.: 1,5 km" value={answers.campusDistance} onChange={updateAnswer} />
        <Field label="Bairro" name="neighborhood" required value={answers.neighborhood} onChange={updateAnswer} />
        <CheckGroup label="Comodidades disponíveis" name="amenities" options={amenities} values={answers.amenities} onToggle={toggleOption} />
        <TextAreaField label="Regras da casa" name="houseRules" placeholder="Ex.: horário de silêncio, visitas e uso das áreas comuns..." value={answers.houseRules} onChange={updateAnswer} />
        <TextAreaField label="Sobre a vaga" name="listingDescription" placeholder="Conte sobre o ambiente e o que procura em um morador..." value={answers.listingDescription} onChange={updateAnswer} />
        <UploadField label="Fotos da casa" name="listingPhotos" multiple answers={answers} onChange={updateAnswer} />
      </div>
    </>;
  }

  function renderOwnerProperty() {
    return <>
      <p className="signup-step-intro">Informe os detalhes do imóvel que deseja anunciar.</p>
      <div className="signup-form-grid">
        <Field label="CEP" name="propertyZip" required value={answers.propertyZip} onChange={updateAnswer} />
        <Field label="Estado" name="propertyState" required value={answers.propertyState} onChange={updateAnswer} />
        <Field label="Cidade" name="propertyCity" required value={answers.propertyCity} onChange={updateAnswer} />
        <Field label="Bairro" name="propertyNeighborhood" required value={answers.propertyNeighborhood} onChange={updateAnswer} />
        <Field label="Rua" name="propertyStreet" required value={answers.propertyStreet} onChange={updateAnswer} />
        <Field label="Número" name="propertyNumber" required value={answers.propertyNumber} onChange={updateAnswer} />
        <Field label="Complemento" name="propertyComplement" value={answers.propertyComplement} onChange={updateAnswer} />
        <SelectField label="Tipo de imóvel" name="propertyType" options={['Casa', 'Apartamento', 'Kitnet', 'Quarto']} required value={answers.propertyType} onChange={updateAnswer} />
        <Field label="Quartos" name="propertyRooms" type="number" min="0" required value={answers.propertyRooms} onChange={updateAnswer} />
        <Field label="Banheiros" name="bathrooms" type="number" min="0" required value={answers.bathrooms} onChange={updateAnswer} />
        <Field label="Vagas de garagem" name="parking" type="number" min="0" value={answers.parking} onChange={updateAnswer} />
        <Field label="Valor do aluguel (R$)" name="propertyRent" type="number" min="0" required value={answers.propertyRent} onChange={updateAnswer} />
        <Field label="Condomínio mensal (R$)" name="condominium" type="number" min="0" value={answers.condominium} onChange={updateAnswer} />
        <SelectField label="Tipo de contrato" name="contractType" options={['Residencial', 'Temporada', 'Outro']} required value={answers.contractType} onChange={updateAnswer} />
        <SelectField label="Prazo mínimo de permanência" name="minimumStay" options={['3 meses', '6 meses', '12 meses', 'Flexível']} value={answers.minimumStay} onChange={updateAnswer} />
        <CheckGroup label="Características" name="propertyAmenities" options={amenities} values={answers.propertyAmenities} onToggle={toggleOption} />
        <TextAreaField label="Descrição do imóvel" name="propertyDescription" placeholder="Conte sobre o imóvel, localização e diferenciais..." value={answers.propertyDescription} onChange={updateAnswer} maxLength="1000" />
        <TextAreaField label="Regras e informações adicionais" name="propertyRules" placeholder="Ex.: horário de silêncio e regras do condomínio..." value={answers.propertyRules} onChange={updateAnswer} maxLength="500" />
        <UploadField label="Fotos do imóvel" name="propertyPhotos" multiple answers={answers} onChange={updateAnswer} />
      </div>
    </>;
  }

  function renderOwnerDocuments() {
    return <>
      <p className="signup-step-intro">Envie os documentos para comprovar sua identidade e a propriedade do imóvel. Aceitamos JPG, PNG e PDF.</p>
      <h3 className="signup-section-title">Documentos do proprietário</h3>
      <div className="signup-form-grid">
        <UploadField label="RG (frente e verso)" name="identityDocument" required answers={answers} onChange={updateAnswer} />
        <UploadField label="CPF" name="cpfDocument" required answers={answers} onChange={updateAnswer} />
        <UploadField label="Comprovante de residência" name="ownerAddressProof" required answers={answers} onChange={updateAnswer} />
      </div>
      <h3 className="signup-section-title">Documentos do imóvel</h3>
      <div className="signup-form-grid">
        <UploadField label="Escritura ou contrato de compra e venda" name="propertyDeed" required answers={answers} onChange={updateAnswer} />
        <UploadField label="Matrícula atualizada" name="propertyRegistry" required answers={answers} onChange={updateAnswer} />
        <UploadField label="IPTU" name="propertyTax" required answers={answers} onChange={updateAnswer} />
      </div>
    </>;
  }

  function renderStep() {
    if (profileId === 'estudante') {
      if (activeStep === 1) return renderStudentData();
      if (activeStep === 2) return renderConviviality();
      return renderPreferences();
    }
    if (profileId === 'ofertante') {
      if (activeStep === 1) return renderStudentData();
      if (activeStep === 2) return renderConviviality();
      return renderHostListing();
    }
    if (activeStep === 1) return renderOwnerData();
    if (activeStep === 2) return renderOwnerProperty();
    return renderOwnerDocuments();
  }

  if (!activeProfile) {
    return (
      <section ref={pageRef} className="signup-page" aria-labelledby="signup-title">
        <span className="signup-decoration signup-teal" aria-hidden="true" />
        <span className="signup-decoration signup-purple" aria-hidden="true" />
        <div className="signup-content">
          <p className="eyebrow">Moraê · Moradia estudantil em Maceió</p>
          <h1 id="signup-title">Como você deseja usar a Moraê?</h1>
          <p className="signup-intro">Escolha seu perfil para começar o cadastro.</p>
          <div className="signup-profiles">
            {profiles.map((profile) => (
              <button className={`signup-profile ${profile.tone}`} type="button" key={profile.id} onClick={() => chooseProfile(profile.id)}>
                <span className="signup-profile-icon" aria-hidden="true">{profile.icon}</span>
                <span className="signup-profile-copy"><strong>{profile.title}</strong><small>{profile.description}</small></span>
                <span className="signup-profile-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (completed) {
    return <section ref={pageRef} className="signup-page signup-page-flow"><span className="signup-decoration signup-teal" aria-hidden="true" /><span className="signup-decoration signup-purple" aria-hidden="true" /><div className="signup-flow-card signup-success"><span className="signup-success-mark">✓</span><p className="eyebrow">Cadastro preenchido</p><h1>Pronto para continuar!</h1><p>As informações do perfil <strong>{activeProfile.title}</strong> foram preenchidas nesta demonstração. O envio será integrado ao backend.</p><button className="signup-secondary-button" type="button" onClick={() => chooseProfile('')}>Voltar aos perfis</button></div></section>;
  }

  return (
    <section ref={pageRef} className="signup-page signup-page-flow" aria-labelledby="signup-flow-title">
      <span className="signup-decoration signup-teal" aria-hidden="true" />
      <span className="signup-decoration signup-purple" aria-hidden="true" />
      <div className="signup-flow-card">
        <div className="signup-flow-top"><button className="signup-back-link" type="button" onClick={() => activeStep === 1 ? chooseProfile('') : setActiveStep((step) => step - 1)}>← {activeStep === 1 ? 'Trocar perfil' : 'Voltar'}</button><span>{activeProfile.icon} {activeProfile.title}</span></div>
        <Progress steps={activeProfile.steps} activeStep={activeStep} />
        <div className="signup-flow-heading"><p className="eyebrow">Etapa {activeStep} de {activeProfile.steps.length}</p><h1 id="signup-flow-title">{activeProfile.steps[activeStep - 1]}</h1></div>
        <form className="signup-stage-form" onSubmit={submitStep}>
          {renderStep()}
          <div className="signup-stage-actions">
            {activeStep > 1 && <button className="signup-secondary-button" type="button" onClick={() => setActiveStep((step) => step - 1)}>← Voltar</button>}
            <button className="signup-continue" type="submit">{activeStep === activeProfile.steps.length ? 'Finalizar cadastro' : 'Avançar'} <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </div>
    </section>
  );
}
