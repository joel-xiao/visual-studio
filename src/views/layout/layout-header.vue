<template lang="pug">
div#layout-header()
    div.logo
        img(src='@/assets/img/logo/logo.svg')
    div.center
    div.right
        User
</template>

<script setup lang="ts">
import User from './components/user.vue';
</script>

<style lang="scss">
#layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  & > .logo {
    position: relative;
    max-width: 262px;
    height: 100%;

    img {
      position: absolute;
      top: -8px;
      left: 0;
      height: 150%;
    }
  }

  & > .right {
    height: 100%;
  }
}
</style>
