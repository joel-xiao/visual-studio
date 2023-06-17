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

export type RulerDOMRect = DOMRect | { width: number; height: number };

type callbackUpdate = {
  (bindKeys: RulerConfig): void;
};
