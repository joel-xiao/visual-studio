<template>
  <n-color-picker v-bind="$attrs" v-model:value="modelValue" :swatches="swatches" />
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NColorPicker } from 'naive-ui';

export interface IProps {
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
      inset: 0;
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
      --n-panel-background: #1e1e1e;
      --n-bezier: cubic-bezier(.4, 0, .2, 1);
      
      background-color: var(--n-panel-background);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      width: 100%;
      overflow: hidden;

      .n-color-picker-control {
        padding: 8px;

        .n-color-picker-pallete {
          height: 130px;
          .n-color-picker-pallete__layer {
            border-radius: 4px;
          }
        }

        .n-color-picker-preview {
          margin-top: 8px;
          .n-color-picker-preview__dot {
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }

        .n-color-picker-input {
          margin-top: 10px;
          font-size: 11px;
          
          .n-color-picker-input__mode {
            color: var(--theme-color-text-secondary, rgba(255, 255, 255, 0.5));
            font-weight: 600;
            width: 48px;
            padding-right: 4px;
          }

          .n-input {
            --n-border: 1px solid transparent !important;
            --n-border-focus: 1px solid var(--theme-color-blue-700, #3662ec) !important;
            --n-border-hover: 1px solid transparent !important;
            --n-box-shadow-focus: inset 0 0 0 1px var(--theme-color-blue-700, #3662ec) !important;
            --n-color: var(--theme-color-tran-8, rgba(255, 255, 255, 0.08)) !important;
            --n-color-focus: var(--theme-color-tran-12, rgba(255, 255, 255, 0.12)) !important;
            --n-text-color: var(--theme-color-text-primary, rgba(255, 255, 255, 0.9)) !important;
            --n-caret-color: var(--theme-color-blue-700, #3662ec) !important;
            --n-placeholder-color: rgba(255, 255, 255, 0.2) !important;
            --n-height: 26px !important;
            --n-border-radius: 4px !important;
            
            background-color: var(--n-color);
            border-radius: var(--n-border-radius);
            font-size: 11px;
            transition: background-color .3s var(--n-bezier);

            .n-input__border, .n-input__state-border {
              border: var(--n-border);
              transition: border-color .3s var(--n-bezier), box-shadow .3s var(--n-bezier);
            }

            &:hover {
              background-color: var(--theme-color-tran-12, rgba(255, 255, 255, 0.12));
              .n-input__state-border {
                border: var(--n-border-hover);
              }
            }

            &.n-input--focus {
              background-color: var(--n-color-focus);
              .n-input__state-border {
                border: var(--n-border-focus);
                box-shadow: var(--n-box-shadow-focus);
              }
            }

            .n-input__input-el {
              height: var(--n-height);
              line-height: var(--n-height);
              color: var(--n-text-color) !important;
            }
          }
        }

        .n-color-picker-swatches {
          padding: 8px 10px;
          margin: 8px -8px -8px;
          background: rgba(0, 0, 0, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.06);

          .n-color-picker-swatch {
            border-radius: 4px;
            overflow: hidden;
            transition: transform .2s ease;
            
            &:hover {
              transform: scale(1.1);
              z-index: 1;
            }

            .n-color-picker-trigger__fill {
              inset: 0;
            }
          }
        }
      }
    }
  }
}
</style>
