<template>
  <div
    class="basic-switch-pro"
    :class="{ 'is-active': modelValue, 'is-disabled': disabled }"
    @click.stop="toggle"
  >
    <div class="switch-track">
      <div class="switch-thumb">
        <div class="switch-light" v-if="modelValue"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
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
#visual-craft-core .basic-switch-pro {
  --switch-width: 26px;
  --switch-height: 12px;
  --switch-bg: var(--theme-color-gray-300);
  --switch-active-bg: var(--theme-color-blue-700);
  
  display: inline-flex;
  cursor: pointer;
  user-select: none;
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

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  &:hover:not(.is-disabled) .switch-thumb {
    transform: scale(1.1);
  }
}
</style>
