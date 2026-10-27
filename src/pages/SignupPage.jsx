import { useState } from 'react';
import './SignupPage.css';

const profiles = [
  { id: 'estudante', icon: '🎓', title: 'Quero buscar moradia', description: 'Sou estudante buscando uma vaga ou imóvel.', tone: 'student' },
  { id: 'ofertante', icon: '🏡', title: 'Quero ofertar vaga em casa', description: 'Sou estudante e tenho uma vaga disponível.', tone: 'host' },
  { id: 'proprietario', icon: '🔑', title: 'Sou proprietário', description: 'Quero anunciar meu imóvel.', tone: 'owner' },
];

export function SignupPage() {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [feedback, setFeedback] = useState('');

  function continueSignup(event) {
    event.preventDefault();
    const profile = profiles.find(({ id }) => id === selectedProfile);
    if (profile) setFeedback(`Perfil selecionado: ${profile.title}. As próximas etapas do cadastro serão adicionadas ao fluxo.`);
  }

  return (
    <section className="signup-page" aria-labelledby="signup-title">
      <span className="signup-decoration signup-teal" aria-hidden="true" />
      <span className="signup-decoration signup-purple" aria-hidden="true" />
      <div className="signup-content">
        <p className="eyebrow">Moraê · Moradia estudantil em Maceió</p>
        <h1 id="signup-title">Como você deseja usar a Moraê?</h1>
        <p className="signup-intro">Escolha seu perfil para começar.</p>
        <form className="signup-form" onSubmit={continueSignup}>
          <div className="signup-profiles" role="radiogroup" aria-label="Perfil de cadastro">
            {profiles.map((profile) => (
              <button
                className={`signup-profile ${profile.tone}${selectedProfile === profile.id ? ' selected' : ''}`}
                type="button"
                role="radio"
                aria-checked={selectedProfile === profile.id}
                key={profile.id}
                onClick={() => { setSelectedProfile(profile.id); setFeedback(''); }}
              >
                <span className="signup-profile-icon" aria-hidden="true">{profile.icon}</span>
                <span className="signup-profile-copy"><strong>{profile.title}</strong><small>{profile.description}</small></span>
                <span className="signup-profile-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className="signup-continue" type="submit" disabled={!selectedProfile}>Continuar <span aria-hidden="true">→</span></button>
          {feedback && <p className="signup-feedback" role="status">{feedback}</p>}
        </form>
      </div>
    </section>
  );
}
