declare interface IDragResizeBinding extends IDragBinding {
  pos: IDragDataset;
  disabled: boolean;
  active: boolean;
  onUp?: (pos: IDragDataset) => void;
}
