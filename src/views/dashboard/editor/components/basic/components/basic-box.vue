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

const boxStyle = computed(() => {
  console.log({
    [props.type + '-box']: !!props.type,
    active: model.value
  });
  return {
    [props.type + '-box']: !!props.type,
    active: model.value
  };
});

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
    background: var(--color-input-background);
    &:hover {
      background: var(--color-button-secondary-bg-hover);
    }

    &.active {
      background: var(--color-button-secondary-bg-active);
    }
  }

  &.status-button-box {
    height: 30px;
    width: 30px;
    box-shadow: 0 0 0 1px var(--color-tran-6) inset;
    color: var(--theme-color-gray-800);

    &:hover {
      box-shadow: 0 0 0 1px var(--color-tran-12) inset;
    }
    &.active {
      background: var(--theme-color-blue-700);
      color: var(--color-text-primary-white);
    }
  }

  &.input-box {
    background: var(--color-input-background);
    &.active {
      box-shadow: 0 0 0 2px var(--color-focus-border) inset;
    }
  }
}
</style>
