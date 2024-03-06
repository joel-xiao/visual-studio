import { BasicNode } from '../../../hooks/node-context/interface';
export interface IComponent {
  name: string;
  id: string;
  component?: boolean;
  icon?: string;
  data?: BasicNode;
}

export interface IComponentData extends IComponent {
  children?: IComponentData[];
  AFold?: boolean;
  dot?: boolean;
  show?: boolean;
}
