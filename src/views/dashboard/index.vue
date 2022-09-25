<template lang="pug">
div#dashboard(class="not-select")
  router-view
</template>

<script setup lang="ts"></script>

<style lang="scss">
#dashboard {
  background: var(--color-main);
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
