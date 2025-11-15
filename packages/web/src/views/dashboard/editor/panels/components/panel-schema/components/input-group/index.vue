<template lang="pug">
div(class="schema-input-group")
  ul(class="schema-input-group__options")
    li
      Input(v-model="modelValue[0]" :icon="data.icon[0]" :placeholder="data.isMore ? '' : '多个值'" @update="onUpdate")
    template(v-if="data.isMore")
      li
        Input(v-model="modelValue[1]" :icon="data.icon[1]" @update="onUpdate")
      li
        Input(v-model="modelValue[2]" :icon="data.icon[2]" @update="onUpdate")
      li
        Input(v-model="modelValue[3]" :icon="data.icon[3]" @update="onUpdate")
  div(class="schema-input-group__button-switch")
    Button(v-model="data.isMore" icon="icon-spread-out" type="status-button")
</template>

<script lang="ts">
export default {
  name: 'INPUT_GROUP',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { reactive, nextTick } from 'vue';
import Input from './../../../../../../components/basic/c-input/index.vue';
import Button from './../../../../../../components/basic/c-button/index.vue';

interface Props {
  modelValue: number[];
  icon: string | string[];
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0, 0, 0, 0],
  icon: ''
});

const emit = defineEmits(['update:modelValue', 'update']);

const data = reactive({
  icon: Array.isArray(props.icon) ? props.icon : [props.icon, props.icon, props.icon, props.icon],
  isMore: false,
  modelValue: props.modelValue,
  oldValue: props.modelValue[0]
});

function onUpdate() {
  if (!data.isMore) {
    data.modelValue.forEach((value, idx) => {
      if (data.modelValue[idx] === data.oldValue) {
        data.modelValue[idx] = data.modelValue[0];
      }
    });
  }

  data.oldValue = data.modelValue[0];
  emit('update', props.modelValue);
}
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
