export type RulerConfig = {
  interval: number;
  scale: number;
  textTranslateLeft: number;
  textTranslateTop: number;
  size: number;
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

export type RulerPos = {
  x: number;
  y: number;
};

RulerPos;

export type RulerDOMRect = DOMRect | { width: number; height: number };
