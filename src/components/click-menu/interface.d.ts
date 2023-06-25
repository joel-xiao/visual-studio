export interface ClickMenu {
  name: string;
  icon: string;
  id: string;
  children?: ClickMenu[];
  disabled?: boolean;
}
