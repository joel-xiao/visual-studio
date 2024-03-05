<template lang="pug">
n-color-picker(v-bind="$attrs" :swatches="swatches")
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref } from 'vue';

const swatches = ref([
  '#000000', 
  'rgba(0,0,0,0.85)',
  'rgba(0,0,0,0.60)',
  'rgba(0,0,0,0.30)',
  'rgba(0,0,0,0.16)',
  'rgba(0,0,0,0.08)',
  'rgba(0,0,0,0.04)',
  '#FFFFFF',
  '#FA5151',
  '#FF8F1F',
  '#FFC300',
  '#00B578',
  '#07B9B9',
  '#3662EC',
  '#8A38F5',
  '#EB2F96',
  '#FCDBDB',
  '#FFE5CC',
  '#FFF8C6',
  '#CFFEEE',
  '#C7F5F5',
  '#CDE1FD',
  '#E7D4FF',
  '#FFD7ED'
]);

</script>

<style lang="scss">

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
      .n-color-picker-trigger__value, .n-color-picker-checkboard {
        display: none;
      }
    }
  }
}

.v-binder-follower-container {
  .v-binder-follower-content {
    width: 232px;
    box-sizing: border-box;
    .n-color-picker-panel {
      border-radius: 6px;
      width: 100%;
      .n-color-picker-control {
        .n-color-picker-pallete__layer {
          border-radius: 6px;
        }
        padding: 10px;
      }
    }
  }
}
</style>