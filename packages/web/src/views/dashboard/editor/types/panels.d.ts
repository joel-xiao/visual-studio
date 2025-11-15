declare type PanelTab = {
  name?: string;
  id?: string;
  show?: boolean;
};

declare type PanelComponent = {
  name: string;
  id: string;
  component?: boolean;
  icon?: string;
  data?: IBasicNode;
};

declare type PanelComponentData = PanelComponent & {
  children?: PanelComponentData[];
  AFold?: boolean;
  dot?: boolean;
  show?: boolean;
};

declare type PanelLayerItemData = {
  name?: string;
  icon: string;
  id: string;
  sum?: number;
  children?: PanelLayerItemData[];
  AFold?: boolean;
  select?: boolean;
  handle?: boolean;
  parentId?: string | undefined | null;
  cascades?: PanelLayerItemData[];
  data?: { [key: string]: string | undefined | null | boolean | number };
};

declare type PanelLayerItemMenu = {
  name: string;
  icon: string;
  id: string;
  children?: PanelLayerItemMenu[];
  disabled?: boolean;
};
