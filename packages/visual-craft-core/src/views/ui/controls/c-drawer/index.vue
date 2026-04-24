<template>
<teleport :to="teleportTo">
  <transition name="drawer-fade">
    <div v-if="modelValue" class="c-drawer-mask" @click="onMaskClick">
      <transition name="drawer-slide">
        <div v-if="modelValue" class="c-drawer-wrapper" :style="{ width: width }" @click.stop>
          <div class="c-drawer-header">
            <span class="c-drawer-title">{{ title }}</span>
            <div class="c-drawer-close" @click="onClose">
              <CIcon icon="mdi:close" size="small" hover />
            </div>
          </div>
          <div class="c-drawer-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="c-drawer-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CIcon from '../c-icon/index.vue';

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  maskClosable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  width: '400px',
  maskClosable: true,
});

const emit = defineEmits(['update:modelValue', 'close']);

const teleportTo = ref<string | HTMLElement>('body');

onMounted(() => {
  const target = document.querySelector<HTMLElement>('#visual-craft-core') || document.body;
  teleportTo.value = target;
});

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
.c-drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.c-drawer-wrapper {
  background-color: #1e1e1e;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.c-drawer-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .c-drawer-title {
    font-size: 14px;
    font-weight: 600;
  }
}

.c-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.c-drawer-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
