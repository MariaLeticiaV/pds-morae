import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api.js';
import './LoginPage.css';

export function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback('');

    if (password !== passwordConfirmation) {
      setFeedback('A confirmação da senha não corresponde à nova senha.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, password, passwordConfirmation });
      setCompleted(true);
    } catch (error) {
      setFeedback(error.message || 'Não foi possível alterar a senha.');
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
        <section className="login-card recovery-card" aria-labelledby="reset-title">
          <header className="login-card-header">
            <h2 id="reset-title">Criar nova senha</h2>
            <p>Escolha uma senha segura para voltar a acessar sua conta.</p>
          </header>
          {!token ? (
            <p className="recovery-notice recovery-error" role="alert">
              Este link de recuperação é inválido. Solicite um novo link.
            </p>
          ) : completed ? (
            <>
              <p className="recovery-notice" role="status">Senha alterada com sucesso. Você já pode entrar com sua nova senha.</p>
              <p className="recovery-back"><Link to="/login">Ir para o login</Link></p>
            </>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Nova senha</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  value={password}
                />
              </label>
              <label className="login-field">
                <span>Confirmar nova senha</span>
                <input
                  type="password"
                  name="passwordConfirmation"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                  value={passwordConfirmation}
                />
              </label>
              <button className="login-submit" disabled={submitting} type="submit">
                {submitting ? 'Salvando...' : 'Alterar senha'}
              </button>
              {feedback && <p className="recovery-notice recovery-error" role="alert">{feedback}</p>}
            </form>
          )}
          {!completed && <p className="recovery-back"><Link to="/recuperar-senha">Solicitar outro link</Link></p>}
        </section>
      </div>
    </div>
  );
}
