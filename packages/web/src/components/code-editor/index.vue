<template lang="pug">
div(ref="editorContainer" class="code-editor-container")
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import * as monaco from 'monaco-editor';

interface Props {
  modelValue: string;
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

const editorContainer = ref<HTMLElement | null>(null);
// Use shallowRef for the editor instance to avoid performance issues with Vue reactivity
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);

onMounted(() => {
  if (editorContainer.value) {
    editorInstance.value = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme,
      readOnly: props.readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 12,
      tabSize: 2
    });

    editorInstance.value.onDidChangeModelContent(() => {
      const value = editorInstance.value?.getValue() || '';
      if (value !== props.modelValue) {
        emit('update:modelValue', value);
        emit('change', value);
      }
    });
  }
});

watch(() => props.modelValue, (newValue) => {
  if (editorInstance.value) {
    const currentValue = editorInstance.value.getValue();
    if (newValue !== currentValue) {
      editorInstance.value.setValue(newValue);
    }
  }
});

watch(() => props.language, (newLang) => {
  if (editorInstance.value) {
    const model = editorInstance.value.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, newLang);
    }
  }
});

watch(() => props.theme, (newTheme) => {
  monaco.editor.setTheme(newTheme);
});

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});
</script>

<style lang="scss" scoped>
.code-editor-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
}
</style>
