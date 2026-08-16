export type ManifestCallAlertState = {
  isActive: boolean;
  minutesUntilNextCall: number;
};

const CALL_MINUTE = 28;
const ALERT_END_MINUTE = 38;
const MINUTES_PER_HOUR = 60;

export function getManifestCallAlertState(now = new Date()): ManifestCallAlertState {
  const minute = now.getMinutes();
  const isActive = minute >= CALL_MINUTE && minute < ALERT_END_MINUTE;

  if (isActive) {
    return { isActive, minutesUntilNextCall: 0 };
  }

  const minutesUntilNextCall =
    minute < CALL_MINUTE ? CALL_MINUTE - minute : MINUTES_PER_HOUR - minute + CALL_MINUTE;

  return { isActive, minutesUntilNextCall };
}
