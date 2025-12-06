<template>
<PropsLayout :key-value="'props-warp-' + keyValue" :label="propsType.label">
  <PropsItem v-for="(schemaRow, idx) in Schema" :key="idx" :grid-template-columns="getGridTemplateColumns(idx)">
    <template v-for="(prop, ctrl_idx) in schemaRow" :key="ctrl_idx">
      <PropsCtrl
        :model-value="modelValue[prop.key || '']"
        :data-type="prop.type"
        :ctrl="prop.ctrl"
        :icon="prop.icon"
        :ctrl-type="prop.ctrl_type || ''"
        :options="prop?.options"
        @update="onUpdate(prop.key || '', $event)"
        @click="onClick(prop)"
      />
    </template>
  </PropsItem>
</PropsLayout>
</template>

<script lang="ts">
export default {
  component_name: 'PANEL_PROPS_WRAP'
};
</script>
<script setup lang="ts">
import PropsLayout from './props-layout.vue';
import PropsItem from './props-item.vue';
import PropsCtrl from './props-ctrl.vue';
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
    return Array.isArray(Schema.value[idx]) ? Schema.value[idx].map(prop => prop?.size || 'default') : [];
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
