import { BasicNode } from '../../../hooks/node-context/interface';
export interface Component {
  name: string;
  id: string;
  component?: boolean;
  icon?: string;
  data?: BasicNode;
}

export interface ComponentData extends Component {
  children?: ComponentData[];
  AFold?: boolean;
  dot?: boolean;
}
