declare type RulerConfig = {
  textTranslateLeft: number;
  textMargin: number[];
  border: string;
  background: string;
  color: string;
  lineColor: string;
  lineWidth: number;
  deputyLineWidth: number;
  fontSize: string;
};

declare type RulerSetting = {
  left?: number;
  right?: number;
  bottom?: number;
  top?: number;
  size?: number;
};

declare type RulerPos = {
  x: number;
  y: number;
};

declare type RulerDOMRect = DOMRect | { width: number; height: number };
