<template lang="pug">
n-config-provider(:theme="darkTheme" :theme-overrides="themeOverrides" :locale="native.locale" :date-locale="native.dateLocale" class="app-main")
  n-loading-bar-provider
    router-view(v-slot="{ Component }")
      component(:is="Component")
</template>

<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui';
import native from '@/plugins/native-i18n';
import themeOverrides from '@a/style/native/native-ui-theme-overrides.json';
</script>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  min-width: 1024px;
  height: 100%;
  overflow: hidden;
}

body > #app {
  position: absolute;
  top: 0;
  left: 0;

  & > .app-main {
    height: 100%;
    width: 100%;
  }
}
</style>
