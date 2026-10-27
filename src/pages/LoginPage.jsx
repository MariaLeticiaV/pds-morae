import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function EyeIcon({ visible }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? <><path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></> : <><path d="M3 3 21 21" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.6 9.5 6.4a1.2 1.2 0 0 1 0 1.2 15 15 0 0 1-3.1 3.8" /><path d="M6.2 6.3A15 15 0 0 0 2.5 11.4a1.2 1.2 0 0 0 0 1.2C3.5 14.4 6.8 19 12 19c1.1 0 2.1-.2 3-.6" /></>}
    </svg>
  );
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setFeedback('A autenticação será conectada à API do projeto.');
  }

  return (
    <div className="login-page">
      <span className="auth-decoration auth-mint" aria-hidden="true" />
      <span className="auth-decoration auth-teal" aria-hidden="true" />
      <span className="auth-decoration auth-purple" aria-hidden="true" />
      <span className="auth-decoration auth-pink" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-card" aria-labelledby="login-title">
          <header className="login-card-header">
            <h2 id="login-title">Bem-vindo(a) de volta!</h2>
            <p>Faça login para continuar sua jornada na Moraê.</p>
          </header>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>E-mail ou usuário</span>
              <input type="text" name="username" placeholder="Digite seu e-mail ou usuário" autoComplete="username" required />
            </label>
            <label className="login-field">
              <span>Senha</span>
              <span className="password-input-wrap">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Digite sua senha" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}><EyeIcon visible={showPassword} /></button>
              </span>
            </label>
            <button className="login-submit" type="submit">Entrar</button>
          </form>
          <div className="login-divider"><span />ou<span /></div>
          <div className="social-login">
            <button type="button" onClick={() => setFeedback('O acesso com Google será habilitado quando a autenticação estiver integrada.')}><span className="google-mark" aria-hidden="true">G</span>Entrar com o Google</button>
            <button type="button" onClick={() => setFeedback('O acesso com SIGAA será habilitado quando a autenticação estiver integrada.')}><span className="sigaa-mark" aria-hidden="true">S</span>Entrar com o SIGAA</button>
          </div>
          {feedback && <p className="login-feedback" role="status">{feedback}</p>}
          <p className="login-register">Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </section>
      </div>
    </div>
  );
}
