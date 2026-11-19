import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api.js';
import './LoginPage.css';

export function PasswordRecoveryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback('');
    setSubmitted(false);
    setSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (error) {
      setFeedback(error.message || 'Não foi possível solicitar a recuperação de senha.');
    } finally {
      setSubmitting(false);
    }
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
              <input type="email" name="email" placeholder="Digite seu e-mail" autoComplete="email" onChange={(event) => setEmail(event.target.value)} required value={email} />
            </label>
            <button className="login-submit" disabled={submitting} type="submit">{submitting ? 'Enviando...' : 'Enviar instruções'}</button>
          </form>
          {submitted && <p className="recovery-notice" role="status">Se houver uma conta associada a este e-mail, enviaremos um link para redefinir sua senha.</p>}
          {feedback && <p className="recovery-notice recovery-error" role="alert">{feedback}</p>}
          <p className="recovery-back"><Link to="/login">Voltar para o login</Link></p>
        </section>
      </div>
    </div>
  );
}
