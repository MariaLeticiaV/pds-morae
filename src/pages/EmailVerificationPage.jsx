import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  confirmEmailVerification,
  resendEmailVerification,
} from '../services/api.js';
import './LoginPage.css';

// O token só pode ser usado uma vez. Guardar a promessa por token evita que a
// segunda execução do efeito (StrictMode em desenvolvimento) consuma de novo o
// mesmo token e receba "link inválido".
const confirmations = new Map();

function confirmOnce(token) {
  if (!confirmations.has(token)) {
    confirmations.set(token, confirmEmailVerification(token));
  }
  return confirmations.get(token);
}

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [feedback, setFeedback] = useState(
    token ? '' : 'Este link de verificação é inválido.',
  );
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;

    confirmOnce(token)
      .then(() => {
        if (active) setStatus('success');
      })
      .catch((error) => {
        if (!active) return;
        setStatus('error');
        setFeedback(
          error.message || 'Não foi possível confirmar seu e-mail.',
        );
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleResend(event) {
    event.preventDefault();
    setResending(true);
    setResendStatus('');
    try {
      await resendEmailVerification(email);
      setResendStatus(
        'Se houver uma conta pendente com este e-mail, enviamos um novo link.',
      );
    } catch (error) {
      setResendStatus(error.message || 'Não foi possível reenviar o link.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="login-page">
      <span className="auth-decoration auth-mint" aria-hidden="true" />
      <span className="auth-decoration auth-teal" aria-hidden="true" />
      <span className="auth-decoration auth-purple" aria-hidden="true" />
      <span className="auth-decoration auth-pink" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-card recovery-card" aria-labelledby="verify-title">
          <header className="login-card-header">
            <h2 id="verify-title">Confirmação de e-mail</h2>
            <p>Estamos validando o link enviado para o seu e-mail.</p>
          </header>

          {status === 'loading' && (
            <p className="recovery-notice" role="status">Confirmando seu e-mail...</p>
          )}

          {status === 'success' && (
            <>
              <p className="recovery-notice" role="status">
                E-mail confirmado com sucesso. Você já pode entrar na sua conta.
              </p>
              <p className="recovery-back"><Link to="/login">Ir para o login</Link></p>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="recovery-notice recovery-error" role="alert">
                {feedback}
              </p>
              <form className="login-form" onSubmit={handleResend}>
                <label className="login-field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <button className="login-submit" disabled={resending} type="submit">
                  {resending ? 'Enviando...' : 'Reenviar link'}
                </button>
                {resendStatus && (
                  <p className="recovery-notice" role="status">{resendStatus}</p>
                )}
              </form>
              <p className="recovery-back"><Link to="/login">Voltar para o login</Link></p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
