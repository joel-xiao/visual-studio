<template lang="pug">
PropsLayout(:keyValue="'props-warp-' + keyValue" :label="propsType.label")
  PropsItem(v-for="(props, idx) in Schema" :key="idx")
    PropsCtrl(v-for="(prop, ctrl_idx) in props" :key="ctrl_idx" :ctrl="prop.ctrl" v-model="modelValue[prop.key]" @update="onUpdate('x', $event)")
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
import type { ComponentProp, SchemaPropTypes } from './interface';
import { computed } from 'vue';

interface Props {
  modelValue: ComponentProp;
  propsType: SchemaPropTypes;
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
  let schema = Array.isArray(props.propsType.schema) ? props.propsType.schema : [];
  return schema.filter((schema) => Array.isArray(schema));
});

const onUpdate = function (key: string, value: string | number | boolean | undefined | number[]) {
  emit('update', [key, value]);
};
</script>

<style lang="scss"></style>
