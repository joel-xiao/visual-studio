declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $noTauri: function;
    $isTauri: function;
  }
}
