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
  icon?: string;
  schema?: string;
  id: string;
  sum?: number;
  children?: readonly PanelLayerItemData[];
  AFold?: boolean;
  select?: boolean;
  handle?: boolean;
  parentId?: string | undefined | null;
  cascades?: readonly PanelLayerItemData[];
  data?: INode;
};

declare type PanelLayerItemMenu = {
  name: string;
  icon: string;
  id: string;
  children?: PanelLayerItemMenu[];
  disabled?: boolean;
};
