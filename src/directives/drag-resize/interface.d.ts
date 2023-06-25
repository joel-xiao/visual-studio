import { DragDataset as _DragDataset, Binding as _Binding } from '@hooks/drag-hook/interface';

export type DragDataset = _DragDataset;
export interface Binding extends _Binding {
  pos: DragDataset;
  disabled: boolean;
  active: boolean;
  onUp?: (pos: DragDataset) => void;
}
