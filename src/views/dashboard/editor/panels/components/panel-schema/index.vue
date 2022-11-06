<template lang="pug">
div(class = "editor-panel-schema")
  template(v-for="(item, idx) in propsTypes")
    component(:is="getComponent(item.name)" v-model="propsData[item.key]" @update="onUpdate(item.key, item.schema, $event)")
</template>

<script setup lang="ts">
import { computed, reactive, markRaw } from 'vue';
import { cloneDeep } from 'lodash';
import Layout from './layout/index.vue';
import type { ComponentProps, SchemaKeysTypes, SchemaKeyTypes } from './interface';
import { useComponentContext } from '../../../hooks/component-context';
const emit = defineEmits(['update']);

interface Props {
  propsData: ComponentProps;
  propsTypes: SchemaKeysTypes;
}

const props = withDefaults(defineProps<Props>(), {
  propsData: () => ({}),
  propsTypes: () => []
});

const { formatterComponentProp } = useComponentContext();

const onUpdate = function (
  key: string,
  schema: SchemaKeyTypes,
  args: [key: string, value: string | number | boolean | undefined]
) {
  emit(
    'update',
    `${key}.${args[0]}`,
    formatterComponentProp(schema, {
      key: args[0],
      value: args[1]
    })
  );
};

const schemaComponents = reactive({
  [Layout.schema_name as string]: markRaw(Layout)
});

const getComponent = (schema_name: string) => {
  return schemaComponents[schema_name];
};
</script>

<style lang="scss">
.editor-panel-schema {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  padding: 0 6px 90px 12px;
}
</style>
