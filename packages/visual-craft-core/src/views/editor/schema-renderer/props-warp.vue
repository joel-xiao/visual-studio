<template>
<PropsLayout
  :key-value="'props-warp-' + keyValue"
  :label="propsType.label"
  :has-switch="propsType.show_switch"
  :switch-value="switchValue"
  @update:switch-value="onUpdate('show', $event)"
>
  <PropsItem v-for="(schemaRow, idx) in visibleSchema" :key="idx" :grid-template-columns="getGridTemplateColumns(idx, schemaRow)">
    <template v-for="(prop, ctrl_idx) in schemaRow" :key="ctrl_idx">
      <PropsCtrl
        :model-value="getValue(prop.key || '')"
        :data-type="prop.type"
        :ctrl="prop.ctrl"
        :icon="prop.icon"
        layout="vertical"
        :label="prop.label"
        :hint="prop.hint"
        :ctrl-type="(prop as any).ctrl_type || ''"
        :options="(prop as any).options"
        :suffix="(prop as any).suffix"
        :keys="getKeys(prop)"
        @update="onUpdateProp(prop, $event)"
        @click="onClick(prop)"
        @show-change="onShowChange(prop, $event)"
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
  return schema.filter(schema => Array.isArray(schema)) as SchemaKeyType[][];
});

const switchValue = computed(() => (getValue('show') as boolean | undefined) ?? true);

const visibleSchema = computed(() => {
  return Schema.value
    .map(row => row.filter(prop => !prop.v_if || !!get(props.modelValue, prop.v_if)))
    .filter(row => row.length > 0);
});

const getGridTemplateColumns = (idx: number, row?: SchemaKeyType[]) => {
  const targetRow = row || Schema.value[idx];
  return Array.isArray(targetRow) ? targetRow.map(prop => prop?.size || 'default') : [];
};

const getValue = (key: string) => (key ? get(props.modelValue, key) : props.modelValue);

const getKeys = (prop: SchemaKeyType) => ('keys' in prop ? prop.keys : undefined);

const onShowChange = (prop: SchemaKeyType, value: boolean) => emit('update', [`${prop.key}.show`, value]);

const onUpdate = (key: string, value: unknown) => emit('update', [key, value]);

const onUpdateProp = (prop: SchemaKeyType, value: unknown) => {
  if (prop.click && prop.ctrl === 'C_BUTTON') return;
  emit('update', [prop.key || '', value]);
};

const onClick = (prop: SchemaKeyType) => {
  if (!prop.click) return;
  const result = prop.click(props.modelValue);
  if (!result) return;

  if (Array.isArray(result)) {
    if (result.length === 2 && typeof result[0] === 'string') emit('update', result);
  } else if (typeof result === 'object') {
    Object.entries(result).forEach(([key, value]) => emit('update', [key, value]));
  }
};
</script>

<style lang="scss"></style>
