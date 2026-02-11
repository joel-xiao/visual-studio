<template>
  <div class="lite-switch-outer" :class="{ 'is-disabled': disabled }">
    <div
      class="lite-switch"
      :class="{ 'is-active': modelValue }"
      @click.stop="toggle"
    >
      <div class="switch-track">
        <div class="switch-thumb"></div>
      </div>
    </div>
    <span v-if="content" class="lite-switch-content" @click.stop="toggle">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  content?: string | number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  content: '',
  disabled: false
});

const emit = defineEmits(['update:modelValue', 'change']);

const toggle = () => {
  if (props.disabled) return;
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>

<style lang="scss">
#visual-craft-core .lite-switch-outer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.4;
    filter: grayscale(1);
  }

  .lite-switch-content {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
    user-select: none;
  }
}

#visual-craft-core .lite-switch {
  --lite-track-w: 22px;
  --lite-track-h: 12px;
  --lite-thumb-size: 8px;
  --lite-bg-off: var(--theme-color-real-gray-800);
  --lite-bg-on: var(--theme-color-blue-700);

  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  width: 24px;
  user-select: none;
  flex-shrink: 0;
  box-sizing: border-box;

  .switch-track {
    width: var(--lite-track-w);
    height: var(--lite-track-h);
    background-color: var(--lite-bg-off);
    border-radius: 4px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.5),
      0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .switch-thumb {
    width: var(--lite-thumb-size);
    height: var(--lite-thumb-size);
    background: linear-gradient(180deg, var(--theme-color-white) 0%, var(--theme-color-real-gray-200) 100%);
    border-radius: 2.5px;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 1.5px 3px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateX(0);
    will-change: transform;
    border: 0.5px solid rgba(0, 0, 0, 0.2);
  }

  &:hover {
    .switch-track {
      border-color: rgba(0, 0, 0, 0.6);
    }
    .switch-thumb {
      background: var(--theme-color-white);
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }

  &.is-active {
    .switch-track {
      background-color: var(--lite-bg-on);
      border-color: rgba(0, 0, 0, 0.2);
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.2),
        0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:hover {
      .switch-track {
        background-color: var(--theme-color-blue-600);
      }
    }

    .switch-thumb {
      transform: translateX(10px);
      background: var(--theme-color-white);
    }
  }
}
</style>

