<template lang="pug">
div(class="basic-box transition" ref="boxRef" :class="boxStyle" @click="onClick" @mousedown="onMouseDown" @mouseup="onMouseUp")
  slot
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, watch } from 'vue';

interface Props {
  modelValue?: boolean;
  type: string; // status-button button input input-select
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: ''
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
  active: model.value
}));

const onMouseDown = function () {
  if (props.type === 'button') {
    model.value = true;
  }
};

const onMouseUp = function () {
  if (props.type === 'button') {
    model.value = false;
  }
};

const onClick = function () {
  if (props.type === 'status-button') {
    model.value = !model.value;
  }
};

const focus = function () {
  if (props.type === 'input') {
    model.value = true;
  }
};

const blur = function () {
  if (props.type === 'input') {
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
#dashboard .basic-box {
  border-radius: 6px;
  height: 30px;
  min-width: 30px;
  position: relative;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  overflow: hidden;

  &.button-box,
  &.select-box {
    justify-content: center;
    background: var(--db-color-input-background);

    &:hover {
      background: var(--db-color-button-bg-hover);
    }

    &.active {
      background: var(--db-color-button-bg-active);
    }
  }

  &.status-button-box {
    height: 30px;
    width: 30px;
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
  &.input-select-box {
    background: var(--db-color-input-background);

    &.active {
      box-shadow: 0 0 0 2px var(--db-color-button-focus-border) inset;
    }
  }

  &[circle] {
    border-radius: 50%;
  }
}
</style>
