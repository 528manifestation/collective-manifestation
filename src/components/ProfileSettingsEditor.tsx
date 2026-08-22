import { FormEvent, useEffect, useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  MemberProfile,
  ProfileClientLike,
  ProfileSettingsErrors,
  ProfileSettingsForm,
  getMemberProfile,
  initialProfileSettingsForm,
  profileToSettingsForm,
  updateMemberProfile,
  validateProfileSettingsForm,
} from '../lib/memberProfile';
import { MemberDashboardSession } from './ProtectedMemberDashboard';

type ProfileSettingsEditorProps = {
  session: MemberDashboardSession;
};

function fallbackProfileFromSession(session: MemberDashboardSession): MemberProfile {
  return {
    id: 'id' in session ? session.id : 'local-preview',
    username: session.username,
    displayName: session.username,
    timezone: '',
    country: '',
    role: session.role,
  };
}

function getProfileClient(): ProfileClientLike | null {
  return supabase as ProfileClientLike | null;
}

export function ProfileSettingsEditor({ session }: ProfileSettingsEditorProps) {
  const [profile, setProfile] = useState<MemberProfile>(() => fallbackProfileFromSession(session));
  const [form, setForm] = useState<ProfileSettingsForm>(initialProfileSettingsForm);
  const [errors, setErrors] = useState<ProfileSettingsErrors>({});
  const [status, setStatus] = useState('Loading profile settings…');
  const isEditable = isSupabaseConfigured && session.source === 'supabase-auth';

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!isEditable) {
        const fallback = fallbackProfileFromSession(session);
        setProfile(fallback);
        setForm(profileToSettingsForm(fallback));
        setStatus('Sign in to save profile settings.');
        return;
      }

      const result = await getMemberProfile(getProfileClient(), session.id);
      if (!isMounted) {
        return;
      }

      if (result.ok) {
        setProfile(result.profile);
        setForm(profileToSettingsForm(result.profile));
        setStatus('Profile settings loaded.');
      } else {
        setStatus(result.error);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isEditable, session]);

  function updateField<Field extends keyof ProfileSettingsForm>(field: Field, value: ProfileSettingsForm[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateProfileSettingsForm(form);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setStatus('Please fix the highlighted profile fields.');
      return;
    }

    if (!isEditable) {
      setStatus('Sign in to save profile settings.');
      return;
    }

    const result = await updateMemberProfile(getProfileClient(), session.id, form);
    if (result.ok) {
      setProfile(result.profile);
      setForm(profileToSettingsForm(result.profile));
      setStatus('Profile settings saved.');
    } else {
      setStatus(result.error);
    }
  }

  return (
    <form className="profile-settings-form" onSubmit={handleSubmit} noValidate>
      <div className="profile-settings-header">
        <div>
          <span>Profile settings</span>
          <h4>{profile.username}</h4>
        </div>
        <span className="profile-settings-lock">{isEditable ? 'Protected' : 'View only'}</span>
      </div>

      <label>
        <span>Display name</span>
        <input
          autoComplete="name"
          name="profile-display-name"
          onChange={(event) => updateField('displayName', event.target.value)}
          placeholder="How your name should appear"
          type="text"
          value={form.displayName}
        />
        {errors.displayName ? <small className="field-error">{errors.displayName}</small> : null}
      </label>

      <label>
        <span>Timezone</span>
        <input
          autoComplete="off"
          name="profile-timezone"
          onChange={(event) => updateField('timezone', event.target.value)}
          placeholder="America/New_York"
          type="text"
          value={form.timezone}
        />
        {errors.timezone ? <small className="field-error">{errors.timezone}</small> : null}
      </label>

      <label>
        <span>Country / region</span>
        <input
          autoComplete="country-name"
          name="profile-country"
          onChange={(event) => updateField('country', event.target.value)}
          placeholder="United States"
          type="text"
          value={form.country}
        />
        {errors.country ? <small className="field-error">{errors.country}</small> : null}
      </label>

      <button className="button primary" type="submit">
        {isEditable ? 'Save profile settings' : 'Review profile settings'}
      </button>

      <p className="auth-status">{status}</p>
    </form>
  );
}
