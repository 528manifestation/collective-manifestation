import { LocalMemberSession } from '../lib/memberAuth';

type ProtectedMemberDashboardProps = {
  session: LocalMemberSession;
  onSignOut: () => void;
};

const dashboardItems = [
  {
    title: 'Profile settings',
    description: 'Username, display name, timezone, and country fields will live in the profiles table.',
  },
  {
    title: 'Music downloads',
    description: 'Future member-only download controls can be gated here after Supabase Auth is live.',
  },
  {
    title: 'ManifestWave check-in',
    description: 'A future check-in can record participation without exposing private member information.',
  },
];

export function ProtectedMemberDashboard({ session, onSignOut }: ProtectedMemberDashboardProps) {
  return (
    <section className="protected-dashboard" aria-label="Protected member dashboard preview">
      <div className="dashboard-header">
        <div>
          <span>Protected preview</span>
          <h3>Welcome, {session.username}</h3>
          <p>{session.email}</p>
        </div>
        <button className="button secondary" onClick={onSignOut} type="button">
          Sign out preview
        </button>
      </div>

      <div className="dashboard-meta" aria-label="Local session details">
        <span>Role: {session.role}</span>
        <span>{session.source === 'signup-preview' ? 'Signup preview session' : 'Login preview session'}</span>
      </div>

      <div className="dashboard-grid">
        {dashboardItems.map((item) => (
          <article key={item.title}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <p className="dashboard-note">
        This panel is protected by local preview state only. Real protection will come from Supabase Auth
        sessions and row-level security before launch.
      </p>
    </section>
  );
}
