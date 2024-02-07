declare module '*.vue' {
  interface ComponentCustomProperties {
    $noNative: function;
    $isNative: function;
  }
}
