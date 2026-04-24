<template>
<div ref="boxRef" class="basic-box transition" :class="boxStyle" @click="onClick" @mousedown="onMouseDown" @mouseup="onMouseUp">
  <slot></slot>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, watch } from 'vue';

interface Props {
  modelValue?: boolean;
  type: string; // status-button button input input-select
  size?: 'small' | 'medium' | 'large' | 'mini';
  square?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: '',
  size: 'medium',
  square: false
});

const emit = defineEmits(['update:modelValue', 'update']);

const model = ref(props.modelValue);

watch(props, newValue => {
  if (newValue.modelValue !== model.value) {
    model.value = newValue.modelValue;
  }
});

watchEffect(() => {
  emit('update:modelValue', model.value);
  emit('update', model.value);
});

const boxStyle = computed(() => ({
  [props.type + '-box']: !!props.type,
  [props.size]: !!props.size,
  'is-square': props.square,
  active: model.value
}));

const onMouseDown = function () {
  if (props.type === 'button' || props.type === 'hover') {
    model.value = true;
  }
};

const onMouseUp = function () {
  if (props.type === 'button' || props.type === 'hover') {
    model.value = false;
  }
};

const onClick = function () {
  if (props.type === 'status-button') {
    model.value = !model.value;
  }
};

const focus = function () {
  if (props.type === 'input' || props.type === 'textarea') {
    model.value = true;
  }
};

const blur = function () {
  if (props.type === 'input' || props.type === 'textarea') {
    model.value = false;
  }
};

const boxRef = ref<null | HTMLElement>(null);
const getRect = function () {
  return boxRef.value?.getBoundingClientRect() || { width: 0, height: 0, left: 0, top: 0 };
};

defineExpose({ focus, blur, getRect });
</script>

<style lang="scss">
#visual-craft-core .basic-box {
  border-radius: 6px;
  position: relative;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  overflow: hidden;

  &.button-box,
  &.select-box,
  &.hover-box {
    justify-content: center;
    background: var(--db-color-input-background);

    &:hover {
      background: var(--db-color-button-bg-hover);
    }

    &.active {
      background: var(--db-color-button-bg-active);
    }
  }

  &.hover-box {
    background: transparent;
    cursor: pointer;
  }

  &.group-item-box {
    justify-content: center;
    background: var(--db-color-button-group-item-background);

    &:hover {
      background: var(--db-color-button-group-item-bg-hover);
    }

    &.active {
      box-shadow: 0 0 0 1px var(--db-color-button-group-item-active) inset;
      background: var(--db-color-button-group-item-active);
      color: var(--db-color-button-group-item-active-text);
    }
  }

  &.status-button-box {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 1px var(--db-color-button-status-border) inset;
    color: var(--db-color-button-status-color);

    &:hover {
      box-shadow: 0 0 0 1px var(--db-color-button-status-hover-border) inset;
    }

    &.active {
      box-shadow: 0 0 0 1px var(--db-color-button-status-bg-active) inset;
      background: var(--db-color-button-status-bg-active);
      color: var(--db-color-button-active);
    }
  }

  &.input-box,
  &.textarea-box,
  &.input-select-box {
    background: var(--db-color-input-background);

    &.active {
      box-shadow: 0 0 0 2px var(--db-color-button-focus-border) inset;
    }
  }

  &.textarea-box {
    height: auto;
    min-height: 30px;
    align-items: flex-start;
  }

  &[circle] {
    border-radius: 50%;
  }

  // Size overrides (placed at the end for precedence)
  &.mini {
    height: 18px;
    min-width: 18px;
    &.is-square { width: 18px; }
  }
  &.small {
    height: 24px;
    min-width: 24px;
    &.is-square { width: 24px; }
  }
  &.medium {
    height: 30px;
    min-width: 30px;
    &.is-square { width: 30px; }
  }
  &.large {
    height: 36px;
    min-width: 36px;
    &.is-square { width: 36px; }
  }

  // Default size if no class is present
  &:not(.mini):not(.small):not(.medium):not(.large) {
    height: 30px;
    min-width: 30px;
    &.is-square { width: 30px; }
  }
}
</style>
