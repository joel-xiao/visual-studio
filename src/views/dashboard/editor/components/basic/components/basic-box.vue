<template lang="pug">
div(class="basic-box transition" :class="boxStyle" @click="onClick" @mousedown="onMouseDown" @mouseup="onMouseUp")
  slot
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue?: boolean;
  type: string; // status-button button input
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: ''
});

const emit = defineEmits(['update:modelValue']);

const model = ref(props.modelValue);

watch(props, (newValue) => {
  if (newValue.modelValue !== model.value) {
    model.value = newValue.modelValue;
  }
});

watch(model, (newValue) => {
  emit('update:modelValue', newValue);
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

defineExpose({ focus, blur });
</script>

<style lang="scss">
#editor .basic-box {
  border-radius: 6px;
  height: 30px;
  position: relative;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;

  &.button-box {
    justify-content: center;
    background: var(--db-editor-color-input-background);
    &:hover {
      background: var(--db-editor-color-button-bg-hover);
    }

    &.active {
      background: var(--db-editor-color-button-bg-active);
    }
  }

  &.status-button-box {
    height: 30px;
    width: 30px;
    box-shadow: 0 0 0 1px var(--db-editor-status-button-border) inset;
    color: var(--db-editor-status-button-color);

    &:hover {
      box-shadow: 0 0 0 1px var(--db-editor-status-button-hover-border) inset;
    }
    &.active {
      background: var(--db-editor-status-button-bg-active);
      color: var(--db-editor-color-button-active);
    }
  }

  &.input-box {
    background: var(--db-editor-color-input-background);
    &.active {
      box-shadow: 0 0 0 2px var(--db-editor-color-button-focus-border) inset;
    }
  }
}
</style>
