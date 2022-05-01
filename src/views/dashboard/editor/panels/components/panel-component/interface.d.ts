export interface Component {
  name?: string;
  id?: string;
  component?: boolean;
  icon?: string;
}

export interface ComponentData extends Component {
  children?: ComponentData[];
  AFold?: boolean;
  dot?: boolean;
}
