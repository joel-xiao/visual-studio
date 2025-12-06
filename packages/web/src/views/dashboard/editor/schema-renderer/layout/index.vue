<template>
<PropsLayout key-value="component-layout" class="component-layout">
  <PropsItem>
    <Input :model-value="modelValue.x" @update="onUpdate('x', $event)" />
    <Input :model-value="modelValue.y" @update="onUpdate('y', $event)" />
  </PropsItem>
  <PropsItem>
    <Input :model-value="modelValue.width" @update="onUpdate('width', $event)" />
    <Input :model-value="modelValue.height" @update="onUpdate('height', $event)" />
    <Button v-model="data.isLockScale" type="status-button" icon="icon-locking-ratio" />
  </PropsItem>
  <PropsItem>
    <Input :model-value="modelValue.rotate" @update="onUpdate('rotate', $event)" />
    <div class="component-layout-rotate">
      <Button icon="icon-reverse-x" @click="onRotate('x')" />
      <Button icon="icon-reverse-y" @click="onRotate('y')" />
    </div>
  </PropsItem>
  <PropsItem :grid-template-columns="['largely']">
    <Radius :model-value="modelValue.radius" :icon="['icon-radius-tl', 'icon-radius-tr', 'icon-radius-br', 'icon-radius-bl']" @update="onUpdate('radius', $event)" />
  </PropsItem>
</PropsLayout>
</template>

<script lang="ts">
export default {
  schema_name: 'COMMON_OLD_LAYOUT'
};
</script>
<script setup lang="ts">
import { reactive, watch } from 'vue';
import PropsLayout from '../props-layout.vue';
import PropsItem from './../props-item.vue';
import Input from '../../../ui/controls/c-input/index.vue';
import Button from '../../../ui/controls/c-button/index.vue';
import Radius from './../input-group/index.vue';

type PanelSchemaLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  radius: number[];
};

interface Props {
  modelValue?: PanelSchemaLayout;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotate: 0,
    radius: [0, 0, 0, 0]
  })
});

const emit = defineEmits(['update:modelValue', 'update']);

const data = reactive({
  isLockScale: false
});

const onUpdate = function (key: string, value: string | number | boolean | undefined) {
  emit('update', [key, value]);
};

const onRotate = function (type: string) {
  let newRotate = props.modelValue.rotate;
  if (type === 'x') newRotate = 180 - newRotate;
  if (type === 'y') newRotate = -newRotate;
  emit('update', ['rotate', newRotate]);
};
</script>

<style lang="scss">
.editor-schema-renderer .component-layout {
  .component-layout-rotate {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 6px;
  }
}
</style>
