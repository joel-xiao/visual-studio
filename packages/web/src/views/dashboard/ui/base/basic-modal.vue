<template lang="pug">
teleport(to="#dashboard")
  transition(name="fade")
    div(v-if="modelValue" class="basic-modal-mask" @click="onMaskClick")
      div(class="basic-modal-wrapper" :style="{ width: width }" @click.stop)
        div(class="basic-modal-header")
          span(class="basic-modal-title") {{ title }}
          div(class="basic-modal-close" @click="onClose")
            i(class="icon-font icon-guanbi")
        div(class="basic-modal-body")
          slot
        div(v-if="$slots.footer" class="basic-modal-footer")
          slot(name="footer")
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  maskClosable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: 'Edit',
  width: '800px',
  maskClosable: true,
});

const emit = defineEmits(['update:modelValue', 'close']);

function onClose() {
  emit('update:modelValue', false);
  emit('close');
}

function onMaskClick() {
  if (props.maskClosable) {
    onClose();
  }
}
</script>

<style lang="scss" scoped>
.basic-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.basic-modal-wrapper {
  background-color: var(--db-main-color-card-bg);
  border-radius: var(--border-radius-4);
  box-shadow: var(--shadow-m);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  color: var(--theme-color-text-primary);
}

.basic-modal-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--theme-color-real-gray-600);
  font-size: var(--font-size-md);
  font-weight: 500;

  .basic-modal-close {
    cursor: pointer;
    color: var(--theme-color-text-secondary);
    transition: color 0.2s;

    &:hover {
      color: var(--theme-color-text-primary);
    }
  }
}

.basic-modal-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  min-height: 400px;
}

.basic-modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--theme-color-real-gray-600);
  display: flex;
  justify-content: flex-end;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
