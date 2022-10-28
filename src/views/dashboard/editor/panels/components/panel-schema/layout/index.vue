<template lang="pug">
ContainerLayout(keyValue="component-layout" class="component-layout")
  PropsItem
    Input(v-model="modelValue.x")
    Input(v-model="modelValue.y")
  PropsItem
    Input(v-model="modelValue.w")
    Input(v-model="modelValue.h")
    Button(v-model="data.isLockScale" type="status-button")
  PropsItem
    Input(v-model="modelValue.rotate")
    div(class="component-layout-rotate")
      Button(@click="onRotate('x')")
      Button(@click="onRotate('y')")
  PropsItem(type="radius")
    Radius(v-model="modelValue.radius")
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import ContainerLayout from '../components/container-layout.vue';
import PropsItem from './../components/props-item.vue';
import Input from './../../../../components/basic/c-input/index.vue';
import Button from './../../../../components/basic/c-button/index.vue';
import Radius from './../radius/index.vue';
import type { PanelSchemaLayout } from './interface';

interface Props {
  modelValue?: PanelSchemaLayout;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    rotate: 0,
    radius: [0, 0, 0, 0]
  })
});

const emit = defineEmits(['update:modelValue']);

const data = reactive({
  isLockScale: false
});

const onRotate = function (type: string) {
  let modelValue = reactive(props.modelValue);
  if (type === 'x') modelValue.rotate = 180 - modelValue.rotate;
  if (type === 'y') modelValue.rotate = -modelValue.rotate;
};
</script>

<style lang="scss">
.editor-panel-schema .component-layout {
  .component-layout-rotate {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 6px;
  }
}
</style>
