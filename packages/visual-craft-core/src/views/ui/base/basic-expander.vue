<template>
  <div
    class="basic-expander"
    :class="[size, { 'is-active': modelValue, 'is-disabled': disabled }]"
    @click.stop="toggle"
  >
    <div class="expander-core">
      <div class="core-dot"></div>
      <div class="orbit-segment top"></div>
      <div class="orbit-segment right"></div>
      <div class="orbit-segment bottom"></div>
      <div class="orbit-segment left"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'small'
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
#visual-craft-core .basic-expander {
  --expander-color: var(--theme-color-text-primary);
  --active-color: var(--theme-color-blue-700);
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 20px;
  height: 20px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); // Bouncy transition

  .expander-core {
    width: 12px;
    height: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .core-dot {
    width: 3px;
    height: 3px;
    background-color: var(--expander-color);
    border-radius: 50%;
    transition: all 0.35s ease;
    opacity: 0.6;
  }

  .orbit-segment {
    position: absolute;
    background-color: var(--expander-color);
    opacity: 0.3;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-radius: 1px;

    &.top, &.bottom { width: 6px; height: 1.5px; }
    &.left, &.right { width: 1.5px; height: 6px; }

    &.top { top: 0; transform: translateY(0); }
    &.bottom { bottom: 0; transform: translateY(0); }
    &.left { left: 0; transform: translateX(0); }
    &.right { right: 0; transform: translateX(0); }
  }

  // Hover effect: Core pulses
  &:hover:not(.is-disabled) {
    .core-dot { transform: scale(1.5); opacity: 1; color: var(--active-color); }
    .orbit-segment { opacity: 0.6; }
  }

  // Active state: The "Starburst" Expansion
  &.is-active {
    transform: rotate(45deg);
    
    .core-dot {
      background-color: var(--active-color);
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 5px var(--active-color);
    }

    .orbit-segment {
      background-color: var(--active-color);
      opacity: 0.8;
      
      &.top { transform: translateY(-3px); }
      &.bottom { transform: translateY(3px); }
      &.left { transform: translateX(-3px); }
      &.right { transform: translateX(3px); }
    }
  }

  &.is-disabled {
    cursor: default;
    opacity: 0.45; // Enhanced visibility to prevent "missing" feeling
    filter: grayscale(1);
    
    .core-dot {
      opacity: 0.8;
    }
  }
}
</style>
