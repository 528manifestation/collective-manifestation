type SupabaseError = {
  message: string;
};

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  timezone: string | null;
  country: string | null;
  role: 'member' | 'moderator' | 'admin';
};

type ProfileSelectQuery = {
  eq(column: string, value: string): {
    single(): PromiseLike<{ data: ProfileRow | null; error: SupabaseError | null }>;
  };
};

type ProfileUpdateQuery = {
  eq(column: string, value: string): {
    select(columns: string): {
      single(): PromiseLike<{ data: ProfileRow | null; error: SupabaseError | null }>;
    };
  };
};

type ProfileTable = {
  select(columns: string): ProfileSelectQuery;
  update(payload: ProfileUpdatePayload): ProfileUpdateQuery;
};

export type ProfileClientLike = {
  from(table: 'profiles'): ProfileTable;
};

export type MemberProfile = {
  id: string;
  username: string;
  displayName: string;
  timezone: string;
  country: string;
  role: 'member' | 'moderator' | 'admin';
};

export type ProfileSettingsForm = {
  displayName: string;
  timezone: string;
  country: string;
};

export type ProfileSettingsErrors = Partial<Record<keyof ProfileSettingsForm, string>>;

export type ProfileResult<T extends object> = ({ ok: true } & T) | { ok: false; error: string };

type ProfileUpdatePayload = {
  display_name: string;
  timezone: string;
  country: string;
};

const profileColumns = 'id, username, display_name, timezone, country, role';

export const initialProfileSettingsForm: ProfileSettingsForm = {
  displayName: '',
  timezone: '',
  country: '',
};

function trimProfileValue(value: string): string {
  return value.trim();
}

function getErrorMessage(error: SupabaseError | null, fallback: string): string {
  return error?.message || fallback;
}

function mapProfileRow(row: ProfileRow): MemberProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || '',
    timezone: row.timezone || '',
    country: row.country || '',
    role: row.role,
  };
}

export function profileToSettingsForm(profile: MemberProfile): ProfileSettingsForm {
  return {
    displayName: profile.displayName,
    timezone: profile.timezone,
    country: profile.country,
  };
}

export function validateProfileSettingsForm(form: ProfileSettingsForm): {
  isValid: boolean;
  errors: ProfileSettingsErrors;
} {
  const errors: ProfileSettingsErrors = {};

  if (trimProfileValue(form.displayName).length > 60) {
    errors.displayName = 'Display name must be 60 characters or fewer.';
  }

  if (trimProfileValue(form.timezone).length > 80) {
    errors.timezone = 'Timezone must be 80 characters or fewer.';
  }

  if (trimProfileValue(form.country).length > 80) {
    errors.country = 'Country must be 80 characters or fewer.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export async function getMemberProfile(
  client: ProfileClientLike | null,
  userId: string,
): Promise<ProfileResult<{ profile: MemberProfile }>> {
  if (!client) {
    return { ok: false, error: 'Supabase is not configured yet.' };
  }

  const result = await client.from('profiles').select(profileColumns).eq('id', userId).single();
  if (result.error) {
    return { ok: false, error: getErrorMessage(result.error, 'Could not load profile.') };
  }

  if (!result.data) {
    return { ok: false, error: 'Profile was not found for this member.' };
  }

  return { ok: true, profile: mapProfileRow(result.data) };
}

export async function updateMemberProfile(
  client: ProfileClientLike | null,
  userId: string,
  form: ProfileSettingsForm,
): Promise<ProfileResult<{ profile: MemberProfile }>> {
  if (!client) {
    return { ok: false, error: 'Supabase is not configured yet.' };
  }

  const validation = validateProfileSettingsForm(form);
  if (!validation.isValid) {
    return { ok: false, error: 'Invalid profile settings.' };
  }

  const payload: ProfileUpdatePayload = {
    display_name: trimProfileValue(form.displayName),
    timezone: trimProfileValue(form.timezone),
    country: trimProfileValue(form.country),
  };

  const result = await client.from('profiles').update(payload).eq('id', userId).select(profileColumns).single();
  if (result.error) {
    return { ok: false, error: getErrorMessage(result.error, 'Could not update profile.') };
  }

  if (!result.data) {
    return { ok: false, error: 'Updated profile was not returned.' };
  }

  return { ok: true, profile: mapProfileRow(result.data) };
}
