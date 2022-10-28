<template lang="pug">
div(class="schema-radius")
  ul(class="schema-radius__options")
    li
      Input(v-model="data.radius" :placeholder="data.isMore ? '' : '多个值'")
    template(v-if="data.isMore")
      li
        Input(v-model="modelValue[1]")
      li
        Input(v-model="modelValue[2]")
      li
        Input(v-model="modelValue[3]")
  div(class="schema-radius__button-switch")
    Button(v-model="data.isMore" type="status-button")

</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import Input from './../../../../components/basic/c-input/index.vue';
import Button from './../../../../components/basic/c-button/index.vue';
import type { PanelSchemaRadius } from './interface';

interface Props {
  modelValue: PanelSchemaRadius;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0, 0, 0, 0]
});

const emit = defineEmits(['update:modelValue']);

const data = reactive({
  isMore: false,
  radius: props.modelValue[0] + ''
});

watch(data, (newValue) => {
  if (data.isMore) {
    let radius = Number(newValue.radius);
    radius = isNaN(radius) ? 0 : radius;
    emit('update:modelValue', [
      radius,
      props.modelValue[1],
      props.modelValue[2],
      props.modelValue[3]
    ]);
  } else {
    const isRadius = newValue.radius.includes(',');
    if (!isRadius) {
      let radius = Number(newValue.radius);
      radius = isNaN(radius) ? 0 : radius;
      emit('update:modelValue', [radius, radius, radius, radius]);
    } else {
      let radius = newValue.radius
        .split(',')
        .map((r) => Number(newValue.radius))
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
.editor-panel-schema .schema-radius {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 30px;
  grid-gap: 6px;

  & > .schema-radius__options {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-gap: 6px;
  }

  & > .schema-radius__button-switch {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto;
    row-gap: 6px;
  }
}
</style>
