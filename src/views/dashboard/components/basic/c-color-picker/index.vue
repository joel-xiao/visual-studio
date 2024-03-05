<template lang="pug">
BasicBox(class="c-color-picker" type="input")
  ColorPicker
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  name: 'C_COLOR_PICKER',
};
</script>

<script setup lang="ts">
import BasicBox from '../components/basic-box.vue';

</script>

<style lang="scss">
.c-color-picker {
  .n-color-picker {
    height: 100%;

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
}
</style>