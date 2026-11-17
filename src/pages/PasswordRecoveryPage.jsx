import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

export function PasswordRecoveryPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="login-page">
      <span className="auth-decoration auth-mint" aria-hidden="true" />
      <span className="auth-decoration auth-teal" aria-hidden="true" />
      <span className="auth-decoration auth-purple" aria-hidden="true" />
      <span className="auth-decoration auth-pink" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-card recovery-card" aria-labelledby="recovery-title">
          <header className="login-card-header">
            <h2 id="recovery-title">Recuperar senha</h2>
            <p>Informe o e-mail associado à sua conta para iniciar a recuperação.</p>
          </header>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>E-mail</span>
              <input type="email" name="email" placeholder="Digite seu e-mail" autoComplete="email" required />
            </label>
            <button className="login-submit" type="submit">Enviar instruções</button>
          </form>
          {submitted && <p className="recovery-notice" role="status">A recuperação ainda não está conectada ao serviço de autenticação. Nenhum e-mail foi enviado.</p>}
          <p className="recovery-back"><Link to="/login">Voltar para o login</Link></p>
        </section>
      </div>
    </div>
  );
}
