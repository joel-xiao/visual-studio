import { IScene } from './types';
import { DashboardDesignScene } from './scenes/dashboard-design';
import { ChartCreationScene } from './scenes/chart-creation';

export const scenes: IScene[] = [
  DashboardDesignScene,
  ChartCreationScene
];

export const getScene = (value: string) => scenes.find(s => s.value === value);
