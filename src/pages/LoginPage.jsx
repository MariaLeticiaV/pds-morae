import { useEffect, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  completeGoogleLogin,
  getGoogleLoginUrl,
  loginUser,
} from '../services/api.js';
import {
  getAdministratorSession,
  loginAdministrator,
} from '../services/adminAuth.js';
import { getUserSession } from '../services/userAuth.js';
import { getDemoUser, saveDemoUser } from '../utils/demoUser.js';
import { homeForAccountType } from '../utils/accountHome.js';
import './LoginPage.css';


function internalReturnPath(location, accountType) {
  const path = location.state?.from;
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  if (accountType === 'ADMINISTRATOR') return path.startsWith('/admin') ? path : null;
  return path.startsWith('/admin') ? null : path;
}

function EyeIcon({ visible }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3 21 21" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.6 9.5 6.4a1.2 1.2 0 0 1 0 1.2 15 15 0 0 1-3.1 3.8" />
          <path d="M6.2 6.3A15 15 0 0 0 2.5 11.4a1.2 1.2 0 0 0 0 1.2C3.5 14.4 6.8 19 12 19c1.1 0 2.1-.2 3-.6" />
        </>
      )}
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(() =>
    (() => {
      if (searchParams.get('cadastro') === 'sucesso') {
        return 'Cadastro recebido. Confirme seu e-mail pelo link enviado antes de entrar.';
      }

      const oauthMessages = {
        cancelled: 'O acesso com Google foi cancelado.',
        register: 'Não encontramos uma conta Moraê com este e-mail. Cadastre-se primeiro.',
        inactive: 'Esta conta Moraê não está ativa. Entre em contato com o suporte.',
        linked: 'Esta conta Moraê já está vinculada a outra conta Google.',
        unavailable: 'O acesso com Google está temporariamente indisponível. Tente novamente mais tarde.',
        failed: 'Não foi possível confirmar sua conta Google. Tente novamente.',
      };
      return oauthMessages[searchParams.get('oauth')] || '';
    })(),
  );
  const [feedbackType, setFeedbackType] = useState(() =>
    searchParams.get('oauth') && searchParams.get('oauth') !== 'cancelled'
      ? 'error'
      : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const googleCodeProcessing = useRef(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (fragment.get('oauth') !== 'google') return;
    const code = fragment.get('code');
    if (googleCodeProcessing.current) return;
    googleCodeProcessing.current = true;
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`,
    );

    async function finishGoogleLogin() {
      try {
        const session = await completeGoogleLogin(code);
        const currentUser = getDemoUser();
        const role = currentUser?.role || 'estudante';
        saveDemoUser(
          session.name || currentUser?.name || session.email,
          role,
          currentUser?.profile || {},
          { userId: session.userId },
        );
        const destination = internalReturnPath(location, session.accountType)
          || homeForAccountType(session.accountType);
        navigate(destination, { replace: true });
      } catch (error) {
        setFeedback(error.message || 'Não foi possível concluir o acesso com Google.');
        setFeedbackType('error');
      }
    }

    finishGoogleLogin();
  }, [location, navigate]);

  const administratorSession = getAdministratorSession();
  const userSession = getUserSession();

  if (administratorSession) {
    return <Navigate to="/admin" replace />;
  }

  if (userSession) {
    return (
      <Navigate
        to={internalReturnPath(location, userSession.accountType) || homeForAccountType(userSession.accountType)}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setFeedback('');
    setFeedbackType('');
    setIsSubmitting(true);

    try {
      const identifier = username.trim();
      const returnTo = location.state?.from;

      if (identifier.includes('@')) {
        let result;
        try {
          result = await loginUser({
            email: identifier,
            password,
          });
        } catch (userError) {
          // O e-mail pode ser da conta ligada a um administrador, que entra
          // com a senha de administrador. Se também falhar, vale o erro original.
          if (userError.status !== 401) throw userError;
          try {
            await loginAdministrator({ login: identifier, password });
          } catch {
            throw userError;
          }
          navigate(
            typeof returnTo === 'string' && returnTo.startsWith('/admin/')
              ? returnTo
              : '/admin',
            { replace: true },
          );
          return;
        }

        const currentUser = getDemoUser();
        const role = currentUser?.role || 'estudante';

        saveDemoUser(
          result.name || currentUser?.name || identifier,
          role,
          currentUser?.profile || {},
          { userId: result.userId },
        );

        const defaultDestination = homeForAccountType(result.accountType);

        navigate(
          internalReturnPath(location, result.accountType) || defaultDestination,
          { replace: true },
        );

        return;
      }

      await loginAdministrator({
        login: identifier,
        password,
      });

      navigate(
        typeof returnTo === 'string' && returnTo.startsWith('/admin/')
          ? returnTo
          : '/admin',
        { replace: true },
      );
    } catch (error) {
      setFeedback(
        error.message || 'Não foi possível autenticar. Confira suas credenciais.',
      );
      setFeedbackType('error');
    } finally {
      setIsSubmitting(false);
    }
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
              <span>E-mail ou login de administrador</span>
              <input
                type="text"
                name="username"
                placeholder="Digite seu e-mail ou login de administrador"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <span className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </span>
            </label>

            <div className="login-form-options">
              <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-divider">
            <span />
            ou
            <span />
          </div>

          <div className="social-login">
            <button
              type="button"
              disabled={isGoogleRedirecting}
              onClick={() => {
                setFeedback('');
                setFeedbackType('');
                setIsGoogleRedirecting(true);
                window.location.assign(getGoogleLoginUrl());
              }}
            >
              <span className="google-mark" aria-hidden="true">
                G
              </span>
              {isGoogleRedirecting ? 'Conectando ao Google…' : 'Entrar com o Google'}
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedback(
                  'O acesso via SIGAA depende da integração oficial de SSO da UFAL. Não informe sua senha SIGAA nesta página.',
                );
                setFeedbackType('info');
              }}
            >
              <span className="sigaa-mark" aria-hidden="true">
                S
              </span>
              Entrar com o SIGAA
            </button>
          </div>

          {feedback && (
            <p
              className={`login-feedback${feedbackType === 'error' ? ' error' : ''}`}
              role={feedbackType === 'error' ? 'alert' : 'status'}
            >
              {feedback}
            </p>
          )}

          <p className="login-register">
            Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
