'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import type { AttendanceLedgerSession } from '../types/attendance';

dayjs.extend(duration);

export function useAttendanceDuration() {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const getSessionDuration = useCallback((session: AttendanceLedgerSession) => {
    const start = dayjs(session.checkIn);
    const end = session.checkOut ? dayjs(session.checkOut) : now;
    const diffMs = Math.max(0, end.diff(start));
    const durationValue = dayjs.duration(diffMs);
    const hours = Math.floor(durationValue.asHours());
    const minutes = durationValue.minutes();
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  }, [now]);

  return {
    now,
    getSessionDuration,
  };
}
