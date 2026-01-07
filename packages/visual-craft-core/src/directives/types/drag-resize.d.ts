declare interface IDragResizeBinding extends IDragBinding {
  pos: IDragDataset;
  disabled: boolean;
  active: boolean;
  onUp?: (pos: IDragDataset) => void;
  onMove?: (pos: IDragDataset) => void;
  onDown?: (pos: IDragDataset) => void;
}
