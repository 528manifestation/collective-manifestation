import { useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { WaveParticipationClientLike, recordWaveParticipation } from '../lib/waveParticipation';

export function WatchVideoBar() {
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? 'Clicking the watch bar records member participation when signed in.'
      : 'Supabase is not configured yet, so watch tracking is disabled locally.',
  );
  const [isRecording, setIsRecording] = useState(false);

  async function handleWatchClick() {
    if (!isSupabaseConfigured) {
      setStatusMessage('Supabase is not configured yet, so watch tracking is disabled locally.');
      return;
    }

    setIsRecording(true);
    const result = await recordWaveParticipation(supabase as WaveParticipationClientLike | null, 'started_ritual');
    if (result.ok) {
      setStatusMessage(`Participation counted for UTC${result.activeManifestWaveSlot >= 0 ? '+' : ''}${result.activeManifestWaveSlot}.`);
    } else {
      setStatusMessage(result.error);
    }
    setIsRecording(false);
  }

  return (
    <div>
      <button
        aria-label="Watch the Intention for Manifestation video"
        className="video-placeholder large watch-video-bar"
        disabled={isRecording}
        onClick={() => void handleWatchClick()}
        type="button"
      >
        <span>Watch video</span>
        <strong>{isRecording ? 'Recording participation…' : 'Start the Intention for Manifestation video at 5:28.'}</strong>
        <p>Click this bar to watch. Signed-in member clicks are counted for wave-strength analytics.</p>
      </button>
      <p className="watch-video-status" aria-live="polite">
        {statusMessage}
      </p>
    </div>
  );
}
