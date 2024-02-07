export interface ComBindKeys {
  isSpace: boolean;
  isShift: boolean;
  isCtrl: boolean;
  isAlt: boolean;
}

export interface CallbackUpdate {
  (bindKeys: ComBindKeys): void;
}
