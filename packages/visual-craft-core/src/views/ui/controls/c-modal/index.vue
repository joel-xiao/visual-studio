<template>
  <BasicModal
    v-bind="$attrs"
    :model-value="modelValue"
    :title="title"
    :width="width"
    class="c-modal"
    @update:model-value="val => $emit('update:modelValue', val)"
    @close="$emit('close')"
  >
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </BasicModal>
</template>

<script lang="ts">
export default {
  name: 'C_MODAL',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BasicModal from '../../base/basic-modal.vue';

defineProps<{
  modelValue: boolean;
  title?: string;
  width?: string;
}>();

defineEmits(['update:modelValue', 'close']);
</script>

<style lang="scss">
/* Global styles for CModal to provide a specialized look */
.basic-modal-mask.c-modal {
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);

  .basic-modal-wrapper {
    border: 1px solid var(--db-main-border-black);
    background-color: var(--db-editor-color-panel-bg);
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    overflow: hidden;
  }

  .basic-modal-header {
    padding: 20px 24px;
    height: auto;
    border-bottom: 1px solid var(--db-main-border-black);
    
    .basic-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
    }

    .basic-modal-close {
      font-size: 18px;
      opacity: 0.5;
      transition: all 0.2s;
      &:hover {
        opacity: 1;
        transform: rotate(90deg);
      }
    }
  }

  .basic-modal-body {
    padding: 0;
    min-height: auto;
  }

  .basic-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--db-main-border-black);
    background: var(--theme-color-gray-50);
  }
}
</style>
