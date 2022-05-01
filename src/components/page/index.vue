<template lang="pug">
div(class='c-page')
  slot
</template>

<script lang="ts" setup></script>

<style scoped lang="scss">
.c-page {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 4px;
}
</style>
