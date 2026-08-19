export type AdminRole = 'member' | 'moderator' | 'admin';

export type AdminProfile = {
  username: string;
  role: AdminRole;
};

type AdminQueryResult = {
  data: AdminProfile | null;
  error: { message?: string } | null;
};

export type AdminProfileClientLike = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<AdminQueryResult>;
      };
    };
  };
};

export type AdminAccessResult =
  | { ok: true; isAdmin: boolean; profile: AdminProfile | null }
  | { ok: false; isAdmin: false; error: string };

export async function checkAdminAccess(
  client: AdminProfileClientLike | null,
  userId: string,
): Promise<AdminAccessResult> {
  if (!client || !userId) {
    return { ok: true, isAdmin: false, profile: null };
  }

  const result = await client.from('profiles').select('username, role').eq('id', userId).maybeSingle();

  if (result.error) {
    return { ok: false, isAdmin: false, error: result.error.message || 'Could not verify admin access.' };
  }

  return {
    ok: true,
    isAdmin: result.data?.role === 'admin',
    profile: result.data,
  };
}
