<template lang="pug">
div(class="schema-input-group")
  ul(class="schema-input-group__options")
    li
      Input(v-model="data.radius" :placeholder="data.isMore ? '' : '多个值'" @update="onUpdate")
    template(v-if="data.isMore")
      li
        Input(v-model="modelValue[1]" @update="onUpdate")
      li
        Input(v-model="modelValue[2]" @update="onUpdate")
      li
        Input(v-model="modelValue[3]" @update="onUpdate")
  div(class="schema-input-group__button-switch")
    Button(v-model="data.isMore" type="status-button")
</template>

<script setup lang="ts">
import { reactive, watchEffect, nextTick } from 'vue';
import Input from './../../../../../components/basic/c-input/index.vue';
import Button from './../../../../../components/basic/c-button/index.vue';
import type { PanelSchemaRadius } from './interface';

interface Props {
  modelValue: PanelSchemaRadius;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0, 0, 0, 0]
});

const emit = defineEmits(['update:modelValue', 'update']);

const onUpdate = function () {
  nextTick(() => {
    emit('update', props.modelValue);
  });
};

const data = reactive({
  isMore: false,
  radius: props.modelValue[0] + ''
});

watchEffect(() => {
  if (data.isMore) {
    let radius = Number(data.radius);
    radius = isNaN(radius) ? 0 : radius;
    emit('update:modelValue', [
      radius,
      props.modelValue[1],
      props.modelValue[2],
      props.modelValue[3]
    ]);
  } else {
    const isRadius = data.radius.includes(',');
    if (!isRadius) {
      let radius = Number(data.radius);
      radius = isNaN(radius) ? 0 : radius;
      emit('update:modelValue', [radius, radius, radius, radius]);
    } else {
      let radius = data.radius
        .split(',')
        .map((r) => Number(data.radius))
        .map((r) => (isNaN(r) ? 0 : r));

      if (radius.length === 2) {
        emit('update:modelValue', [radius[0], radius[1], props.modelValue[2], props.modelValue[3]]);
      } else if (radius.length === 3) {
        emit('update:modelValue', [radius[0], radius[1], radius[2], props.modelValue[3]]);
      } else if (radius.length === 4) {
        emit('update:modelValue', [radius[0], radius[1], radius[2], radius[3]]);
      }
    }
  }
});
</script>

<style lang="scss">
.editor-panel-schema .schema-input-group {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 30px;
  grid-gap: 6px;

  & > .schema-input-group__options {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-gap: 6px;
  }

  & > .schema-input-group__button-switch {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    row-gap: 6px;
  }
}
</style>
