import { createApp } from 'vue';
export interface DragDataset {
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
  pos?: DragDataset;
  cursorPos?: CursorPos | null;
  resize?: boolean;
  disabled?: boolean;
  active?: boolean;
  scale?: number;
  onUp?: (dragDataset: DragDataset) => void;
}
