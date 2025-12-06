<template>
  <n-color-picker v-model:value="modelValue" :swatches="swatches" />
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface IProps {
  modelValue: string;
}
const props = withDefaults(defineProps<IProps>(), {
  modelValue: undefined
});

const emit = defineEmits(['update:modelValue']);

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const swatches = ref([
  '#000000',
  'rgba(0,0,0,0.85)',
  'rgba(0,0,0,0.60)',
  'rgba(0,0,0,0.30)',
  'rgba(0,0,0,0.16)',
  'rgba(0,0,0,0.08)',
  // 'rgba(0,0,0,0.04)',
  '#FFFFFF',
  '#FA5151',
  '#FF8F1F',
  '#FFC300',
  '#00B578',
  '#07B9B9',
  '#3662EC',
  '#8A38F5',
  // '#EB2F96',
  '#FCDBDB',
  '#FFE5CC',
  '#FFF8C6',
  '#CFFEEE',
  '#C7F5F5',
  '#CDE1FD',
  '#E7D4FF'
  // '#FFD7ED'
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
      .n-color-picker-trigger__value,
      .n-color-picker-checkboard {
        display: none;
      }
    }
  }
}

.v-binder-follower-container {
  .v-binder-follower-content {
    width: 196px;
    box-sizing: border-box;
    .n-color-picker-panel {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.6);
      background-color: #212121;
      border-radius: 6px;
      width: 100%;
      .n-color-picker-control {
        padding: 6px;

        .n-color-picker-pallete .n-color-picker-pallete__layer {
          border-radius: 4px;
        }
        .n-color-picker-swatches {
          padding-left: 4px;
          box-sizing: border-box;
        }

        .n-color-picker-input {
          font-size: 12px;
          .n-color-picker-input__mode {
            width: 54px;
            padding-left: 2px;
            text-align: left;
          }
          .n-input-group {
            border-radius: 4px;
            overflow: hidden;
            .n-input {
              background-color: rgba(255, 255, 255, 0.08);

              .n-input__input-el {
                height: 24px;
                line-height: 24px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
, h
