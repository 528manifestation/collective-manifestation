import { FormEvent, useState } from 'react';

import {
  ContactInterest,
  ContactWaitlistErrors,
  ContactWaitlistForm as ContactWaitlistFormState,
  createContactWaitlistPayload,
  initialContactWaitlistForm,
  validateContactWaitlistForm,
} from '../lib/contactForm';

type InterestOption = {
  value: Exclude<ContactInterest, ''>;
  label: string;
};

const interestOptions: InterestOption[] = [
  { value: 'waitlist', label: 'Join the early update list' },
  { value: 'question', label: 'Ask a question' },
  { value: 'volunteer', label: 'Volunteer or collaborate' },
  { value: 'support', label: 'Support / donation question' },
];

export function ContactWaitlistForm() {
  const [form, setForm] = useState<ContactWaitlistFormState>(initialContactWaitlistForm);
  const [errors, setErrors] = useState<ContactWaitlistErrors>({});
  const [statusMessage, setStatusMessage] = useState('');

  function updateField<Field extends keyof ContactWaitlistFormState>(
    field: Field,
    value: ContactWaitlistFormState[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateContactWaitlistForm(form);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setStatusMessage('Please fix the highlighted fields before sending.');
      return;
    }

    const payload = createContactWaitlistPayload(form);
    console.info('Local-only contact/waitlist preview payload:', payload);
    setStatusMessage('Thank you — your note is ready.');
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input
            autoComplete="name"
            name="name"
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Your name"
            type="text"
            value={form.name}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
          {errors.email ? <small className="field-error">{errors.email}</small> : null}
        </label>
      </div>

      <label>
        <span>Reason for reaching out</span>
        <select
          name="interest"
          onChange={(event) => updateField('interest', event.target.value as ContactInterest)}
          value={form.interest}
        >
          <option value="">Choose one</option>
          {interestOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.interest ? <small className="field-error">{errors.interest}</small> : null}
      </label>

      <label>
        <span>Message</span>
        <textarea
          name="message"
          onChange={(event) => updateField('message', event.target.value)}
          placeholder="Tell us what you are interested in, what question you have, or how you may want to help."
          rows={5}
          value={form.message}
        />
        {errors.message ? <small className="field-error">{errors.message}</small> : null}
      </label>

      <div className="checkbox-stack">
        <label>
          <input
            checked={form.wantsUpdates}
            onChange={(event) => updateField('wantsUpdates', event.target.checked)}
            type="checkbox"
          />
          <span>Send me Collective Manifestation launch updates.</span>
        </label>
        <label>
          <input
            checked={form.wantsToVolunteer}
            onChange={(event) => updateField('wantsToVolunteer', event.target.checked)}
            type="checkbox"
          />
          <span>I may be interested in volunteering or helping review the site.</span>
        </label>
      </div>

      <div className="form-actions">
        <button className="button primary" type="submit">
          Share note
        </button>
        <p>{statusMessage || 'Questions and offers to help are welcome.'}</p>
      </div>
    </form>
  );
}
