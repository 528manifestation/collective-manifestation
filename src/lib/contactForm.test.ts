import { describe, expect, it } from 'vitest';

import {
  createContactWaitlistPayload,
  initialContactWaitlistForm,
  validateContactWaitlistForm,
} from './contactForm';

describe('contact/waitlist form helpers', () => {
  it('requires a name, valid email, interest, and message', () => {
    const result = validateContactWaitlistForm(initialContactWaitlistForm);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      interest: 'Please choose the reason you are reaching out.',
      message: 'Please add a short message.',
    });
  });

  it('accepts a complete contact message with update and volunteer preferences', () => {
    const result = validateContactWaitlistForm({
      name: ' Rick ',
      email: 'rick@example.com ',
      interest: 'volunteer',
      message: ' I would like to help with launch review. ',
      wantsUpdates: true,
      wantsToVolunteer: true,
    });

    expect(result).toEqual({ isValid: true, errors: {} });
  });

  it('trims the local preview payload and marks it as not submitted to Supabase', () => {
    const payload = createContactWaitlistPayload({
      name: ' Rick ',
      email: 'RICK@EXAMPLE.COM ',
      interest: 'question',
      message: ' Can I join any hour? ',
      wantsUpdates: true,
      wantsToVolunteer: false,
    });

    expect(payload).toMatchObject({
      name: 'Rick',
      email: 'rick@example.com',
      interest: 'question',
      message: 'Can I join any hour?',
      wantsUpdates: true,
      wantsToVolunteer: false,
      submissionMode: 'local-preview',
    });
    expect(payload.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
