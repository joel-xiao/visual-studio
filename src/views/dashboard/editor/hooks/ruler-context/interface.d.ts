export type RulerConfig = {
  interval: number;
  scale: number;
  scaleTranslate: number;
  offset: number;
  color: string;
  deputyColor: string;
  lineWidth: number;
  deputyLineWidth: number;
  fontSize: string;
};

export type RulerSetting = {
  left?: number;
  right?: number;
  bottom?: number;
  top?: number;
  size?: number;
};

export type RulerDOMRect = DOMRect | { width: number; height: number };
