import type { ViewMode } from '../style-controls';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LooseRecord = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StyleChange = (key: string, value: any) => void;

export type StyleRead = (key: string) => unknown;
export type StyleWrite = (key: string, value: unknown) => void;

/**
 * Props shared by every group component under style-inspector/.
 * Every group needs raw style access (`styles` + `onChange`) plus the
 * responsive `read/write` pair that swaps to the mobile-prefixed keys
 * when the viewport is mobile.
 */
export interface GroupProps {
  styles: LooseRecord;
  onChange: StyleChange;
  read: StyleRead;
  write: StyleWrite;
  viewMode: ViewMode;
}

export type { ViewMode };
