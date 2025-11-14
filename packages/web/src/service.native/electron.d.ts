declare global {
  interface Window {
    electron?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => boolean;
      on: (channel: string, listener: (...args: any[]) => void) => () => void;
      isElectron: boolean;
      platform: string;
    };
  }
}

export {};

