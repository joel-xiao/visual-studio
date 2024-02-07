declare module '*.vue' {
  interface ComponentCustomProperties {
    $noTauri: function;
    $isTauri: function;
  }
}
