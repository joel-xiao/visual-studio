import type { IAIMessage } from '@/service/api/ai';

export interface ISceneAction {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IChatMessage extends IAIMessage {
  id: string;
  type?: 'text' | 'code' | 'action';
  actions?: ISceneAction[];
  isError?: boolean;
}

export interface IScene {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;

  /**
   * Execution logic for the scene
   * Can involve multiple steps, API calls, and state updates
   */
  run(
    addMessage: (role: 'user' | 'assistant', content: string, type?: 'text' | 'code' | 'action', actions?: ISceneAction[], id?: string) => string,
    generateApi: (scene: string, params: unknown) => Promise<unknown>,
    params?: string
  ): Promise<void>;
}
