import { FormEvent, useState } from 'react';

import {
  LocalMemberSession,
  LoginErrors,
  LoginForm,
  SignupErrors,
  SignupForm,
  createLocalMemberSession,
  createLocalLoginPayload,
  createLocalSignupPayload,
  initialLoginForm,
  initialSignupForm,
  validateLoginForm,
  validateSignupForm,
} from '../lib/memberAuth';
import { ProtectedMemberDashboard } from './ProtectedMemberDashboard';

type AuthMode = 'signup' | 'login';

export function MemberAuthPanel() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [signupForm, setSignupForm] = useState<SignupForm>(initialSignupForm);
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm);
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [localSession, setLocalSession] = useState<LocalMemberSession | null>(null);

  function updateSignup<Field extends keyof SignupForm>(field: Field, value: SignupForm[Field]) {
    setSignupForm((current) => ({ ...current, [field]: value }));
    setSignupErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage('');
  }

  function updateLogin<Field extends keyof LoginForm>(field: Field, value: LoginForm[Field]) {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setLoginErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage('');
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateSignupForm(signupForm);
    setSignupErrors(validation.errors);

    if (!validation.isValid) {
      setStatusMessage('Please fix the highlighted signup fields.');
      return;
    }

    const payload = createLocalSignupPayload(signupForm);
    console.info('Local-only member signup preview payload:', payload);
    setLocalSession(createLocalMemberSession(payload));
    setStatusMessage(
      'Signup preview opened the protected dashboard locally. Supabase Auth is still disabled until auth settings and schema are approved.',
    );
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateLoginForm(loginForm);
    setLoginErrors(validation.errors);

    if (!validation.isValid) {
      setStatusMessage('Please fix the highlighted login fields.');
      return;
    }

    const payload = createLocalLoginPayload(loginForm);
    console.info('Local-only member login preview payload:', payload);
    setLocalSession(createLocalMemberSession(payload));
    setStatusMessage(
      'Login preview opened the protected dashboard locally. No password is stored here; Supabase Auth will handle real login later.',
    );
  }

  function handleSignOutPreview() {
    setLocalSession(null);
    setStatusMessage('Signed out of the local dashboard preview.');
  }

  return (
    <div className="member-auth-card">
      <div className="auth-tabs" aria-label="Member auth mode">
        <button
          className={mode === 'signup' ? 'is-active' : ''}
          onClick={() => {
            setMode('signup');
            setStatusMessage('');
          }}
          type="button"
        >
          Sign up
        </button>
        <button
          className={mode === 'login' ? 'is-active' : ''}
          onClick={() => {
            setMode('login');
            setStatusMessage('');
          }}
          type="button"
        >
          Log in
        </button>
      </div>

      {localSession ? (
        <ProtectedMemberDashboard session={localSession} onSignOut={handleSignOutPreview} />
      ) : mode === 'signup' ? (
        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              name="signup-username"
              onChange={(event) => updateSignup('username', event.target.value)}
              placeholder="manifest_member"
              type="text"
              value={signupForm.username}
            />
            {signupErrors.username ? <small className="field-error">{signupErrors.username}</small> : null}
          </label>

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="signup-email"
              onChange={(event) => updateSignup('email', event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={signupForm.email}
            />
            {signupErrors.email ? <small className="field-error">{signupErrors.email}</small> : null}
          </label>

          <div className="form-grid">
            <label>
              <span>Password</span>
              <input
                autoComplete="new-password"
                name="signup-password"
                onChange={(event) => updateSignup('password', event.target.value)}
                placeholder="12+ characters"
                type="password"
                value={signupForm.password}
              />
              {signupErrors.password ? <small className="field-error">{signupErrors.password}</small> : null}
            </label>
            <label>
              <span>Confirm password</span>
              <input
                autoComplete="new-password"
                name="signup-confirm-password"
                onChange={(event) => updateSignup('confirmPassword', event.target.value)}
                placeholder="Repeat password"
                type="password"
                value={signupForm.confirmPassword}
              />
              {signupErrors.confirmPassword ? (
                <small className="field-error">{signupErrors.confirmPassword}</small>
              ) : null}
            </label>
          </div>

          <button className="button primary" type="submit">
            Preview member signup
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="login-email"
              onChange={(event) => updateLogin('email', event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={loginForm.email}
            />
            {loginErrors.email ? <small className="field-error">{loginErrors.email}</small> : null}
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="login-password"
              onChange={(event) => updateLogin('password', event.target.value)}
              placeholder="Your password"
              type="password"
              value={loginForm.password}
            />
            {loginErrors.password ? <small className="field-error">{loginErrors.password}</small> : null}
          </label>

          <button className="button primary" type="submit">
            Preview member login
          </button>
        </form>
      )}

      <p className="auth-status">
        {statusMessage || 'Local preview only — passwords are not saved and Supabase Auth is not called yet.'}
      </p>
    </div>
  );
}
