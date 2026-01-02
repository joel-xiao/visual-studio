declare interface IDragDataset {
  y2: number;
  x2: number;
  x: number;
  y: number;
}

declare interface IDragCursorPos {
  x: number;
  y: number;
}

declare interface IDragBinding {
  pos?: IDragDataset;
  cursorPos?: IDragCursorPos | null;
  resize?: boolean;
  disabled?: boolean;
  active?: boolean;
  scale?: number;
  onUp?: (dragDataset: IDragDataset) => void;
}
