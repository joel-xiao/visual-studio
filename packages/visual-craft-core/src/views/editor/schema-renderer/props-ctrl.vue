<template>
<div class="editor-schema-renderer-props-ctrl" :class="{ 'is-inline': layout === 'inline', 'is-disabled': hasShow && !showValue }">
  <div v-if="showLabel" class="editor-schema-renderer-props-ctrl-header">
    <CLiteSwitch
      v-if="hasShow"
      :model-value="showValue"
      class="ctrl-switch"
      @update:model-value="onShowChange"
    />
    <span class="editor-schema-renderer-props-ctrl-label" :class="{ 'is-small': finalSize === 'small' }">{{ label }}</span>
  </div>
  <div
    v-if="!hasShow || showValue"
    class="editor-schema-renderer-props-ctrl-control"
  >
    <template v-if="getComponent(ctrl)">
      <component
        :is="getComponent(ctrl)"
        :model-value="modelValue"
        :type="ctrlType"
        :size="finalSize"
        :content="content"
        :schema-type="schemaType"
        :effect-schema="effectSchema"
        :schemas="schemas"
        :ctrls="ctrls"
        :keys="keys"
        :icons="icons"
        :hints="hints"
        :suffixes="suffixes"
        :options="options"
        v-bind="$attrs"
        :hint="hint"
        @update="onUpdate"
      />
    </template>
    <div v-else>IS NO {{ ctrl }}</div>
  </div>
</div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  panel_name: 'PANEL_PROPS_CTRL'
};
</script>
<script setup lang="ts">
import { computed, markRaw } from 'vue';
import type { Component } from 'vue';
import { getControlComponent } from './controls-registry';
import CLiteSwitch from '../../ui/controls/c-lite-switch/index.vue';

export interface Props {
  ctrl: string;
  ctrlType?: string;
  ctrlSize?: string;
  layout?: string;
  label?: string | number;
  content?: string | number;
  hint?: string | string[];
  size?: string;
  ctrls?: string[];
  keys?: string[];
  icons?: string[];
  hints?: string[];
  suffixes?: string[];
  options?: unknown[];
  modelValue?: unknown;
  schemaType?: string;
  effectSchema?: string;
  schemas?: ISchemaPropTypes[];
  type?: unknown; // To consume it from $attrs
}

const props = withDefaults(defineProps<Props>(), {
  ctrl: '',
  ctrlType: '',
  ctrlSize: '',
  layout: '',
  label: '',
  content: '',
  hint: undefined,
  size: '',
  ctrls: () => [],
  keys: () => [],
  icons: () => [],
  hints: () => [],
  suffixes: () => [],
  options: () => [],
  modelValue: undefined,
  schemaType: '',
  effectSchema: '',
  schemas: undefined,
  type: undefined
});

const emit = defineEmits(['show-change', 'update']);

const finalSize = computed(() => props.ctrlSize || props.size || '');

const showValue = computed(() => (props.modelValue as Record<string, unknown>)?.show as boolean | undefined);
const hasShow = computed(() => typeof showValue.value === 'boolean');
const showLabel = computed(() => hasShow.value || !!props.label);

const onShowChange = (val: boolean) => emit('show-change', val);

const onUpdate = (val: unknown) => emit('update', val);


const getComponent = (name: string) => getControlComponent(name);
</script>
<style lang="scss">
.editor-schema-renderer .editor-schema-renderer-props-ctrl {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .editor-schema-renderer-props-ctrl-header {
    padding-top: 3px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .ctrl-switch {
      flex-shrink: 0;
    }
  }

  .editor-schema-renderer-props-ctrl-label {
    flex: 1;
    font-size: 12px;
    line-height: 12px;
    font-weight: 600;
    color: var(--theme-color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.is-small {
      font-size: 10px;
      line-height: 10px;
      font-weight: 500;
    }
  }

  .editor-schema-renderer-props-ctrl-control {
    flex: 1;
    min-width: 0;
  }

  &.is-inline {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    .editor-schema-renderer-props-ctrl-label {
      width: 72px;
    }
  }

  &.is-disabled {
    .editor-schema-renderer-props-ctrl-label {
      opacity: 0.5;
    }
  }
}
</style>
