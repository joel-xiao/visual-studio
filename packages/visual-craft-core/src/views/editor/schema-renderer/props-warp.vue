<template>
<PropsLayout
  :key-value="'props-warp-' + keyValue"
  :label="propsType.label"
  :has-switch="propsType.show_switch"
  :switch-value="!!getValue('show')"
  @update:switch-value="onUpdate('show', $event)"
>
  <PropsItem v-for="(schemaRow, idx) in Schema" :key="idx" :grid-template-columns="getGridTemplateColumns(idx)">
    <template v-for="(prop, ctrl_idx) in schemaRow" :key="ctrl_idx">
      <PropsCtrl
        :model-value="getValue(prop.key || '')"
        :data-type="prop.type"
        :ctrl="prop.ctrl"
        :icon="prop.icon"
        layout="vertical"
        :label="prop.label"
        :hint="prop.hint"
        :ctrl-type="prop.ctrl_type || ''"
        :options="prop?.options"
        :suffix="prop.suffix"
        :keys="getKeys(prop)"
        @update="onUpdateProp(prop, $event)"
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
import { get } from 'lodash';

export interface Props {
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

const getValue = (key: string) => {
  return key ? get(props.modelValue, key) : props.modelValue;
};

const getKeys = (prop: SchemaKeyType) => {
  if ('keys' in prop) return prop.keys;
  return undefined;
};

const onUpdate = function (key: string, value: string | number | boolean | undefined | number[]) {
  emit('update', [key, value]);
};

const onUpdateProp = function (propSchema: SchemaKeyType, value: string | number | boolean | undefined | number[]) {
  if (propSchema.click && propSchema.ctrl === 'C_BUTTON') return;
  emit('update', [propSchema.key || '', value]);
};

const onClick = function (propSchema: SchemaKeyType) {
  if (!propSchema.click) return;
  const result = propSchema.click(props.modelValue);
  if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'string') {
    emit('update', result);
    return;
  }
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    Object.entries(result).forEach(([key, value]) => {
      if (typeof key === 'string') emit('update', [key, value]);
    });
  }
};
</script>

<style lang="scss"></style>
