import { createApp } from 'vue';
export interface DargDataset {
  y2: number;
  x2: number;
  x: number;
  y: number;
}

export interface CursorPos {
  x: number;
  y: number;
}

export interface Binding {
  pos?: DargDataset;
  cursorPos?: CursorPos | null;
  resize?: boolean;
  disabled?: boolean;
  active?: boolean;
  onUp?: (dargDataset: DargDataset) => void;
}
