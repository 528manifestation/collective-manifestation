export type ContactInterest = 'question' | 'waitlist' | 'volunteer' | 'support' | '';

export type ContactWaitlistForm = {
  name: string;
  email: string;
  interest: ContactInterest;
  message: string;
  wantsUpdates: boolean;
  wantsToVolunteer: boolean;
};

export type ContactWaitlistErrors = Partial<Record<keyof Pick<ContactWaitlistForm, 'name' | 'email' | 'interest' | 'message'>, string>>;

export type ContactWaitlistValidation = {
  isValid: boolean;
  errors: ContactWaitlistErrors;
};

export type ContactWaitlistPayload = Omit<ContactWaitlistForm, 'interest'> & {
  interest: Exclude<ContactInterest, ''>;
  submissionMode: 'local-preview';
  createdAt: string;
};

export const initialContactWaitlistForm: ContactWaitlistForm = {
  name: '',
  email: '',
  interest: '',
  message: '',
  wantsUpdates: true,
  wantsToVolunteer: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactWaitlistForm(form: ContactWaitlistForm): ContactWaitlistValidation {
  const errors: ContactWaitlistErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!form.interest) {
    errors.interest = 'Please choose the reason you are reaching out.';
  }

  if (!form.message.trim()) {
    errors.message = 'Please add a short message.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createContactWaitlistPayload(form: ContactWaitlistForm): ContactWaitlistPayload {
  if (!form.interest) {
    throw new Error('Cannot create contact/waitlist payload without an interest.');
  }

  return {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    interest: form.interest,
    message: form.message.trim(),
    wantsUpdates: form.wantsUpdates,
    wantsToVolunteer: form.wantsToVolunteer,
    submissionMode: 'local-preview',
    createdAt: new Date().toISOString(),
  };
}
