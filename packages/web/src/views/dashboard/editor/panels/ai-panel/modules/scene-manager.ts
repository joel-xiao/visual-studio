import { IScene } from './types';
import { DashboardDesignScene } from './scenes/dashboard-design';

export const scenes: IScene[] = [
  DashboardDesignScene,
  {
    id: 'scene2',
    label: '场景2: 暂定',
    value: 'scene2',
    disabled: true,
    run: async () => {}
  }
];

export const getScene = (value: string) => scenes.find(s => s.value === value);
