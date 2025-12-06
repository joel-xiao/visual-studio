<script lang="ts" setup>
import { computed, reactive, withDefaults, onUnmounted } from 'vue';

interface Props {
  data?: ICClickMenu[];
  modelValue: boolean;
  size?: 'small' | '';
  x: number;
  y: number;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  modelValue: false,
  size: '',
  x: 0,
  y: 0
});

const emit = defineEmits(['command', 'update:modelValue']);

const contentMenuStyle = computed<{ left: string; top: string }>(() => ({
  left: props.x + 'px',
  top: props.y + 'px'
}));
const show = function (val?: boolean): void {
  emit('update:modelValue', !!val);
};

const open = function (): void {
  show(true);
};
const close = function (): void {
  show(false);
};

close();

defineExpose({
  open,
  close
});

document.addEventListener('click', close);
onUnmounted(() => {
  document.removeEventListener('click', close);
});

const onMenuCommand = function (cmd: ICClickMenu): void {
  close();
  emit('command', cmd);
};
</script>

<template>
  <transition name="c-click-menu-fade">
    <div v-show="modelValue" class="c-click-menu" :style="contentMenuStyle">
      <div v-for="item in data" :key="item.id" class="content-menu-item" @click.prevent="onMenuCommand(item)">
        <Icon class="menu-item-icon" :size="size" :src="item.icon" />
        <span class="menu-item-label">{{ item.name }}</span>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
.c-click-menu-fade-enter-active,
.c-click-menu-fade-leave-active {
  transition: ease-out;
  transition-duration: 0.2s;
  transition-property: opacity, transform;
}

.c-click-menu-fade-enter-from,
.c-click-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.c-click-menu {
  z-index: 999;
  position: fixed;
  left: 0;
  width: 196px;
  padding: 6px;
  background: var(--color-gray-700);
  border: 1px solid var(--theme-color-border);
  border-radius: var(--border-radius-6);
  box-shadow: var(--shadow-m);

  .content-menu-item {
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    border-radius: var(--border-radius-4);

    &:hover {
      background: var(--theme-color-blue-700);

      .menu-item-label,
      .menu-item-icon {
        color: var(--theme-color-text-primary-white);
      }
    }

    .menu-item-icon {
      margin: 0 6px;
    }

    .menu-item-label,
    .menu-item-icon {
      color: var(--theme-color-text-primary);
    }

    .menu-item-label {
      display: inline-block;
      height: 100%;
      font-size: 12px;
    }
  }
}
</style>
