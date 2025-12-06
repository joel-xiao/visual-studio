<template>
<ColorPicker v-bind="$attrs" />
</template>

<script setup lang="ts"></script>

<style lang="scss">
#dashboard .n-color-picker {
  width: 18px;
  height: 18px;
  flex: none;
  margin: 0px 6px;
  border-radius: 3px;
  overflow: hidden;

  .n-color-picker-trigger {
    border: none;
    border-radius: 0;

    .n-color-picker-trigger__fill {
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
