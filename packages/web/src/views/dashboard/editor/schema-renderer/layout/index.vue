<template>
<PropsLayout keyValue="component-layout" class="component-layout">
  <PropsItem>
    <Input v-model="modelValue.x" @update="onUpdate('x', $event)" />
    <Input v-model="modelValue.y" @update="onUpdate('y', $event)" />
  </PropsItem>
  <PropsItem>
    <Input v-model="modelValue.width" @update="onUpdate('width', $event)" />
    <Input v-model="modelValue.height" @update="onUpdate('height', $event)" />
    <Button v-model="data.isLockScale" type="status-button" />
  </PropsItem>
  <PropsItem>
    <Input v-model="modelValue.rotate" @update="onUpdate('rotate', $event)" />
    <div class="component-layout-rotate">
      <Button @click="onRotate('x')" />
      <Button @click="onRotate('y')" />
    </div>
  </PropsItem>
  <PropsItem :gridTemplateColumns="['largely']">
    <Radius v-model="modelValue.radius" :icon="['icon-radius-tl', 'icon-radius-tr', 'icon-radius-br', 'icon-radius-bl']" @update="onUpdate('radius', $event)" />
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
  const modelValue = reactive(props.modelValue);
  if (type === 'x') modelValue.rotate = 180 - modelValue.rotate;
  if (type === 'y') modelValue.rotate = -modelValue.rotate;
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
