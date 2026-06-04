export interface WeekDay {
  idx: number;
  label: string;
}

/** Week scaffold shared by the shift card preview and the template editor. */
export const DAYS: WeekDay[] = [
  { idx: 0, label: 'Sun' },
  { idx: 1, label: 'Mon' },
  { idx: 2, label: 'Tue' },
  { idx: 3, label: 'Wed' },
  { idx: 4, label: 'Thu' },
  { idx: 5, label: 'Fri' },
  { idx: 6, label: 'Sat' },
];
