<template lang="pug">
div(class="c-code-editor")
  div(class="c-code-editor-content")
    BasicCodeEditor(
      v-model="currentValue"
      :language="language"
      :theme="theme"
      style="height: 200px"
    )
    div(class="c-code-editor-expand")
      BasicIcon(icon="icon-kuozhan" hover @click="openModal")

  BasicModal(
    v-model="showModal"
    :title="label"
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
        CButton(@click="onCancel" cancel) 取消
        CButton(@click="onConfirm" primary) 确定
</template>

<script lang="ts">
export default {
  name: 'C_CODE_EDITOR',
  inheritAttrs: false
};
</script>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BasicModal from '../../base/basic-modal.vue';
import BasicCodeEditor from '../../base/basic-code-editor.vue';
import BasicIcon from '../../base/basic-icon.vue';
import CButton from '../c-button/index.vue';

interface Props {
  modelValue?: string;
  label?: string;
  language?: string;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '代码编辑',
  language: 'javascript',
  theme: 'vs-dark'
});

const emit = defineEmits(['update:modelValue', 'update']);

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

function openModal() {
  showModal.value = true;
}

function onCancel() {
  showModal.value = false;
  internalValue.value = props.modelValue; // Reset
}

function onConfirm() {
  emit('update:modelValue', internalValue.value);
  emit('update', internalValue.value);
  showModal.value = false;
}
</script>

<style lang="scss" scoped>
.c-code-editor {
  width: 100%;
}

.c-code-editor-content {
  position: relative;
  border: 1px solid var(--theme-color-real-gray-600);
  border-radius: var(--border-radius-4);
  overflow: hidden;
}

.c-code-editor-expand {
  position: absolute;
  top: 8px;
  right: 8px;
}

.c-code-editor-footer {
  display: flex;
  gap: 8px;
}
</style>
