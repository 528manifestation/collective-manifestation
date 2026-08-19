export type SignupForm = {
  username: string;
  email: string;
  country: string;
  password: string;
  confirmPassword: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type SignupErrors = Partial<Record<keyof SignupForm, string>>;
export type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export type FormValidation<Errors> = {
  isValid: boolean;
  errors: Errors;
};

export type LocalSignupPayload = {
  username: string;
  email: string;
  country: string;
  submissionMode: 'local-preview';
  authProvider: 'supabase-auth';
  createdAt: string;
};

export type LocalLoginPayload = {
  email: string;
  submissionMode: 'local-preview';
  authProvider: 'supabase-auth';
  createdAt: string;
};

export type LocalMemberSession = {
  username: string;
  email: string;
  country: string;
  role: 'member';
  source: 'signup-preview' | 'login-preview';
  startedAt: string;
};

export const initialSignupForm: SignupForm = {
  username: '',
  email: '',
  country: '',
  password: '',
  confirmPassword: '',
};

export const initialLoginForm: LoginForm = {
  email: '',
  password: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9_]{3,24}$/;

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /^[a-z0-9]+$/i.test(password) && /[a-z]/i.test(password) && /\d/.test(password);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeCountry(country: string): string {
  return country.trim().replace(/\s+/g, ' ');
}

export function validateSignupForm(form: SignupForm): FormValidation<SignupErrors> {
  const errors: SignupErrors = {};
  const username = normalizeUsername(form.username);
  const email = normalizeEmail(form.email);
  const country = normalizeCountry(form.country);

  if (!username) {
    errors.username = 'Choose a username.';
  } else if (!usernamePattern.test(username)) {
    errors.username = 'Use 3–24 lowercase letters, numbers, or underscores.';
  }

  if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!country) {
    errors.country = 'Enter your country.';
  } else if (country.length > 80) {
    errors.country = 'Country must be 80 characters or fewer.';
  }

  if (!isStrongPassword(form.password)) {
    errors.password = 'Use at least 8 letters/numbers with at least one letter and one number.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginForm(form: LoginForm): FormValidation<LoginErrors> {
  const errors: LoginErrors = {};

  if (!normalizeEmail(form.email)) {
    errors.email = 'Enter your email address.';
  } else if (!emailPattern.test(normalizeEmail(form.email))) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Enter your password.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createLocalSignupPayload(form: SignupForm): LocalSignupPayload {
  const validation = validateSignupForm(form);
  if (!validation.isValid) {
    throw new Error('Cannot create signup payload from invalid form data.');
  }

  return {
    username: normalizeUsername(form.username),
    email: normalizeEmail(form.email),
    country: normalizeCountry(form.country),
    submissionMode: 'local-preview',
    authProvider: 'supabase-auth',
    createdAt: new Date().toISOString(),
  };
}

export function createLocalLoginPayload(form: LoginForm): LocalLoginPayload {
  const validation = validateLoginForm(form);
  if (!validation.isValid) {
    throw new Error('Cannot create login payload from invalid form data.');
  }

  return {
    email: normalizeEmail(form.email),
    submissionMode: 'local-preview',
    authProvider: 'supabase-auth',
    createdAt: new Date().toISOString(),
  };
}

export function createLocalMemberSession(
  payload: LocalSignupPayload | LocalLoginPayload,
): LocalMemberSession {
  const hasUsername = 'username' in payload;
  const username = hasUsername ? payload.username : payload.email.split('@')[0];

  return {
    username,
    email: payload.email,
    country: hasUsername ? payload.country : '',
    role: 'member',
    source: hasUsername ? 'signup-preview' : 'login-preview',
    startedAt: new Date().toISOString(),
  };
}
