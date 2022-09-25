<template lang="pug">
div#layout-content()
    router-view
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useLoadingBar } from 'naive-ui';

const loadingBar = useLoadingBar();
onMounted(() => {
  loadingBar.start();
  setTimeout(() => {
    loadingBar.finish();
  });
});
</script>

<style lang="scss">
#layout-content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
