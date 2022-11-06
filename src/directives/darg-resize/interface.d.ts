import { DargDataset as _DargDataset, Binding as _Binding } from '@hooks/drag-hook/interface';

export type DargDataset = _DargDataset;
export interface Binding extends _Binding {
  pos: DargDataset;
  disabled: boolean;
  active: boolean;
  onUp?: (pos: DargDataset) => void;
}
