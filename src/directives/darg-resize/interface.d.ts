export interface DargDataset {
  y2: number;
  x2: number;
  x: number;
  y: number;
}

export interface Binding {
  initPos: DargDataset;
  disabled: boolean;
  active: boolean;
}
