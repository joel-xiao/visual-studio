<template lang="pug">
n-config-provider(:theme="darkTheme" :theme-overrides="themeOverrides" :locale="native.locale" :date-locale="native.dateLocale" class="app-main")
  n-loading-bar-provider
    router-view(v-slot="{ Component }")
      component(:is="Component")
</template>

<script setup lang="ts">
// 1import HelloWorld from '@c/HelloWorld.vue';
import { NConfigProvider, darkTheme } from 'naive-ui';
import native from '@/plugins/native-i18n';
import themeOverrides from '@a/style/native/native-ui-theme-overrides.json';
// 导入 invoke 方法
import { invoke } from '@tauri-apps/api/tauri';

// 添加监听函数，监听 DOM 内容加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  // DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
  invoke('close_splashscreen');
});
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
