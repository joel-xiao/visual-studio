<template>
  <div
    class="nano-tech-chip"
    :class="{ 'is-active': modelValue, 'is-disabled': disabled }"
    @click.stop="toggle"
  >
    <!-- 左侧精密棱镜 -->
    <div class="nano-prism">
      <div class="prism-glow"></div>
    </div>
    
    <span class="chip-text">{{ content }}</span>
    
    <!-- 底部极细呼吸线 -->
    <!-- <div class="nano-line"></div> -->
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
#visual-craft-core .nano-tech-chip {
  position: relative;
  width: 100%;
  height: 30px;
  background: var(--db-color-input-background);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  transition: all 0.25s ease;
  box-sizing: border-box;

  /* 精密棱镜 */
  .nano-prism {
    position: relative;
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1.5px;
    margin-right: 12px;
    flex-shrink: 0;
    transform: rotate(45deg);
    transition: all 0.3s ease;

    .prism-glow {
      position: absolute;
      inset: -3px;
      border: 1px solid var(--theme-color-blue-700);
      border-radius: 2px;
      opacity: 0;
      transition: all 0.4s ease;
    }
  }

  .chip-text {
    font-size: 11px;
    font-weight: 600;
    color: var(--theme-color-text-secondary);
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
  }

  /* 底部微弱呼吸条 */
  .nano-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 16px;
    height: 1.5px;
    background: var(--theme-color-blue-700);
    border-radius: 2px 2px 0 0;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  /* ── 激活态 ── */
  &.is-active {
    background: rgba(255, 255, 255, 0.02);

    .nano-prism {
      background: var(--theme-color-blue-700);
      box-shadow: 0 0 8px var(--theme-color-blue-700);
      
      .prism-glow {
        opacity: 0.25;
        inset: -5px;
      }
    }

    .chip-text {
      color: var(--theme-color-text-primary, #fff);
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
    }

    .nano-line {
      opacity: 0.9;
      transform: translateX(-50%) scaleX(1);
      box-shadow: 0 -1px 4px rgba(54, 98, 236, 0.4);
    }
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
}
</style>
