import { AddNode } from '../../../hooks/node-context/interface';
export interface Component {
  name: string;
  id: string;
  component?: boolean;
  icon?: string;
  data?: AddNode;
}

export interface ComponentData extends Component {
  children?: ComponentData[];
  AFold?: boolean;
  dot?: boolean;
}
