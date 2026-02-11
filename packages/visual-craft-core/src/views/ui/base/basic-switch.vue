<template>
  <div class="basic-switch-outer" :class="{ 'is-disabled': disabled }">
    <div
      class="basic-switch-pro"
      :class="{ 'is-active': modelValue }"
      @click.stop="toggle"
    >
      <div class="switch-track">
        <div class="switch-thumb">
          <div v-if="modelValue" class="switch-light"></div>
        </div>
      </div>
    </div>
    <span v-if="content" class="basic-switch-content" @click.stop="toggle">{{ content }}</span>
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
#visual-craft-core .basic-switch-outer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .basic-switch-content {
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 600;
    white-space: nowrap;
    user-select: none;
  }
}

#visual-craft-core .basic-switch-pro {
  --switch-width: 26px;
  --switch-height: 12px;
  --switch-bg: var(--theme-color-gray-300);
  --switch-active-bg: var(--theme-color-blue-700);

  display: inline-flex;
  padding: 4px;

  .switch-track {
    width: var(--switch-width);
    height: var(--switch-height);
    background-color: var(--switch-bg);
    border-radius: 6px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .switch-thumb {
    width: 14px;
    height: 14px;
    background-color: #fff;
    border-radius: 4px;
    position: absolute;
    top: -2px;
    left: -2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    .switch-light {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--switch-active-bg);
      box-shadow: 0 0 4px var(--switch-active-bg);
    }
  }

  &.is-active {
    .switch-track {
      background-color: var(--switch-active-bg);
      opacity: 0.6;
    }
    .switch-thumb {
      left: calc(var(--switch-width) - 10px);
      background-color: #fff;
    }
  }

  &:hover .switch-thumb {
    transform: scale(1.1);
  }
}
</style>
