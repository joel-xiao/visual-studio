export interface ComBindKeys {
  isSpace: boolean;
  isShift: boolean;
  isCtrl: boolean;
  isAlt: boolean;
}

export interface callbackUpdate {
  (bindKeys: ComBindKeys): void;
}
