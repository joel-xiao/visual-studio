declare module '*.vue' {
  interface ComponentCustomProperties {
    $noNative: function;
    $isNative: function;
  }
}

declare interface Window {
  // 补充 electron 类型定义，与预加载脚本暴露的 API 对应
  electron?: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, listener: (...args: any[]) => void) => void;
    removeListener: (channel: string, listener: (...args: any[]) => void) => void;
  };
}
