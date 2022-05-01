<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'

// 导入 invoke 方法
import { invoke } from '@tauri-apps/api/tauri'

// 添加监听函数，监听 DOM 内容加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  // DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
  invoke('close_splashscreen')
})

</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
