<template>
  <div class="c-loading">
    <n-space>
      <n-spin size="large" />
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import { NSpace, NSpin } from 'naive-ui';
</script>

<style lang="scss">
.c-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
