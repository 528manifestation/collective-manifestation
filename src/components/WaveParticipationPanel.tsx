import { useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  WaveParticipationActionType,
  WaveParticipationClientLike,
  recordWaveParticipation,
} from '../lib/waveParticipation';

type ParticipationState = 'idle' | 'saving-started_ritual' | 'saving-completed_ritual';

function getSuccessMessage(actionType: WaveParticipationActionType, slot: number): string {
  const actionCopy = actionType === 'started_ritual' ? 'started' : 'completed';
  return `ManifestWave ${actionCopy} check-in recorded for UTC${slot >= 0 ? '+' : ''}${slot}.`;
}

export function WaveParticipationPanel() {
  const [state, setState] = useState<ParticipationState>('idle');
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? 'Sign in as a member, then record when you start or complete the 5:28 ritual.'
      : 'Supabase is not configured yet, so participation tracking is disabled locally.',
  );

  async function handleRecord(actionType: WaveParticipationActionType) {
    setState(`saving-${actionType}`);
    const result = await recordWaveParticipation(supabase as WaveParticipationClientLike | null, actionType);
    if (result.ok) {
      setStatusMessage(getSuccessMessage(actionType, result.activeManifestWaveSlot));
    } else {
      setStatusMessage(result.error);
    }
    setState('idle');
  }

  const isSaving = state !== 'idle';

  return (
    <div className="wave-participation-panel" aria-label="ManifestWave participation tracking">
      <span>Wave-strength check-in</span>
      <strong>Record your 5:28 participation</strong>
      <p>
        These check-ins help measure real-time wave strength by member, country, browser timezone,
        UTC offset, active ManifestWave zone, and ritual action.
      </p>
      <div className="participation-actions">
        <button
          className="button primary"
          disabled={isSaving || !isSupabaseConfigured}
          onClick={() => void handleRecord('started_ritual')}
          type="button"
        >
          {state === 'saving-started_ritual' ? 'Recording start…' : 'I started the 5:28 ritual'}
        </button>
        <button
          className="button secondary"
          disabled={isSaving || !isSupabaseConfigured}
          onClick={() => void handleRecord('completed_ritual')}
          type="button"
        >
          {state === 'saving-completed_ritual' ? 'Recording completion…' : 'I completed the ritual'}
        </button>
      </div>
      <p className="participation-status" aria-live="polite">
        {statusMessage}
      </p>
      <a className="inline-auth-link" href="#member-auth">
        Members sign in / new members sign up
      </a>
    </div>
  );
}
