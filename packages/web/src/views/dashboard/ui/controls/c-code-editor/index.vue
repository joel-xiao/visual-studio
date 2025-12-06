<template lang="pug">
div(class="c-code-editor")
  div(class="c-code-editor-trigger" @click="openModal")
    span(class="c-code-editor-text") {{ previewText }}
    div(class="c-code-editor-icon")
      i(class="icon-font icon-kuozhan")
  
  BasicModal(
    v-model="showModal"
    :title="label || 'Code Editor'"
    width="80vw"
  )
    BasicCodeEditor(
      v-model="currentValue"
      :language="language"
      :theme="theme"
      style="height: 60vh"
    )
    template(#footer)
      div(class="c-code-editor-footer")
        button(class="c-button" @click="onCancel") Cancel
        button(class="c-button primary" @click="onConfirm") OK
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BasicModal from '../../base/basic-modal.vue';
import BasicCodeEditor from '../../base/basic-code-editor.vue';

interface Props {
  modelValue?: string;
  label?: string;
  language?: string;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Edit Code',
  language: 'javascript',
  theme: 'vs-dark'
});

const emit = defineEmits(['update:modelValue', 'change']);

const showModal = ref(false);
const internalValue = ref('');

// Sync internal value when modal opens or prop changes
watch(() => props.modelValue, (val) => {
  if (!showModal.value) {
    internalValue.value = val;
  }
}, { immediate: true });

const currentValue = computed({
  get: () => internalValue.value,
  set: (val) => internalValue.value = val
});

const previewText = computed(() => {
  if (!props.modelValue) return 'Empty';
  const firstLine = props.modelValue.split('\n')[0];
  return firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine;
});

function openModal() {
  internalValue.value = props.modelValue;
  showModal.value = true;
}

function onCancel() {
  showModal.value = false;
  internalValue.value = props.modelValue; // Reset
}

function onConfirm() {
  emit('update:modelValue', internalValue.value);
  emit('change', internalValue.value);
  showModal.value = false;
}
</script>

<style lang="scss" scoped>
.c-code-editor {
  width: 100%;
}

.c-code-editor-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #212121;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  height: 28px;
  font-size: 12px;
  color: #ccc;

  &:hover {
    border-color: #666;
    color: #fff;
  }

  .c-code-editor-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 8px;
  }

  .c-code-editor-icon {
    display: flex;
    align-items: center;
  }
}

.c-code-editor-footer {
  display: flex;
  gap: 8px;

  .c-button {
    padding: 6px 16px;
    background-color: #3c3c3c;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 12px;

    &:hover {
      background-color: #4c4c4c;
    }

    &.primary {
      background-color: #007acc;

      &:hover {
        background-color: #0062a3;
      }
    }
  }
}
</style>
