<template>
<div class="basic-code-editor">
  <CodeEditor
    v-model="modelValue"
    :language="language"
    :theme="theme"
    :read-only="readOnly"
    @change="onChange"
  />
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'vs-dark',
  readOnly: false
});

const emit = defineEmits(['update:modelValue', 'change']);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

function onChange(val: string) {
  emit('change', val);
}
</script>

<style lang="scss">
#dashboard  .basic-code-editor {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
}
</style>
