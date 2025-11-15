declare interface ICClickMenu {
  name: string;
  icon: string;
  id: string;
  children?: ICClickMenu[];
  disabled?: boolean;
}
