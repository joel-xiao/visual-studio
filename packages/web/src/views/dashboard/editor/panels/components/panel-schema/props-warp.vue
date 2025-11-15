<template lang="pug">
PropsLayout(:keyValue="'props-warp-' + keyValue" :label="propsType.label")
  PropsItem(v-for="(props, idx) in Schema" :key="idx" :gridTemplateColumns="getGridTemplateColumns(idx)")
    PropsCtrl(v-for="(prop, ctrl_idx) in props" :key="ctrl_idx" :dataType="prop.type" :ctrl="prop.ctrl" :icon="prop.icon" :ctrlType="prop.ctrl_type" v-model="modelValue[prop.key]" :options="prop?.options" @update="onUpdate(prop.key, $event)" @click="onClick(prop)" )
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_WRAP'
};
</script>
<script setup lang="ts">
import PropsLayout from './components/props-layout.vue';
import PropsItem from './components/props-item.vue';
import PropsCtrl from './components/props-ctrl.vue';
import { computed } from 'vue';

interface Props {
  modelValue: ComponentProp;
  propsType: ISchemaPropTypes;
  keyValue: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  propsType: () => ({
    name: '',
    label: '',
    key: '',
    schema: []
  }),
  keyValue: ''
});

const emit = defineEmits(['update']);

const Schema = computed(() => {
  const schema = Array.isArray(props.propsType.schema) ? props.propsType.schema : [];
  return schema.filter(schema => Array.isArray(schema));
});

const getGridTemplateColumns = computed(() => {
  return (idx: number) => {
    return Array.isArray(Schema.value[idx]) ? Schema.value[idx].map(prop => prop?.size) : [];
  };
});

const onUpdate = function (key: string, value: string | number | boolean | undefined | number[]) {
  emit('update', [key, value]);
};

const onClick = function (propSchema: SchemaKeyType) {
  propSchema.click?.(props.modelValue);
};
</script>

<style lang="scss"></style>
