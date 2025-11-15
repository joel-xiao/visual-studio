declare module '*.vue' {
  interface ComponentCustomProperties {
    $noClient: function;
    $isClient: function;
  }
}
