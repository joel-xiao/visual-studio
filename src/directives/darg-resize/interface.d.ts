import { DargDataset as _DargDataset } from '@hooks/drag-hooks/interface';

export type DargDataset = _DargDataset;
export interface Binding {
  initPos: DargDataset;
  disabled: boolean;
  active: boolean;
}
