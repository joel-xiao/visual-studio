export type RulerConfig = {
  intervalPixel: number;
  scale: number;
  textTranslateLeft: number;
  textTranslateTop: number;
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
