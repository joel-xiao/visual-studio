<template>
  <div class="input-area-container">
    <SuggestionsPanel
      :suggestions="suggestions"
      :loading="loading"
      :ai-suggestions-enabled="aiSuggestionsEnabled"
      @suggestion-click="$emit('suggestion-click', $event)"
      @toggle-ai-suggestions="$emit('toggle-ai-suggestions')"
    />

    <transition name="fade">
      <ContextIndicator
        v-if="showModeIndicator"
        :target-name="targetName"
        @clear="$emit('clear-selection')"
      />
    </transition>

    <ImageUpload
      ref="imageUploadRef"
      v-model="attachmentsModel"
      :disabled="loading"
    />

    <div style="position: relative; width: 100%; padding: 0;">
      <CTextarea
        ref="inputRef"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="loading"
        :rows="5"
        :max-height="120"
        style="width: 100%; padding-right: 42px;"
        @update:model-value="$emit('update:modelValue', $event)"
        @paste="onPaste"
        @dragover.prevent="onDragEnter"
        @dragenter.prevent="onDragEnter"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      />
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        style="display: none;"
        @change="onFileChange"
      />
      <CButton
        icon="mdi:image-plus"
        :disabled="loading"
        style="position: absolute; right: 6px; bottom: 36px; width: 26px; height: 26px; min-width: 26px; min-height: 26px; max-width: 26px; max-height: 26px; padding: 0; margin: 0; z-index: 10;"
        @click="onClickUpload"
      />
      <CButton
        icon="mdi:send"
        :loading="loading"
        primary
        :disabled="sendDisabled"
        style="position: absolute; right: 6px; bottom: 6px; width: 26px; height: 26px; min-width: 26px; min-height: 26px; max-width: 26px; max-height: 26px; padding: 0; margin: 0; z-index: 10;"
        @click="$emit('send')"
      />
      <div v-if="isDragOver" class="drop-mask">拖拽图片到这里上传</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IPromptSuggestion } from '../hooks/chat/use-chat-context';
import CTextarea from '../../../ui/controls/c-textarea/index.vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import ContextIndicator from './ContextIndicator.vue';
import SuggestionsPanel from './SuggestionsPanel.vue';
import ImageUpload from './ImageUpload.vue';
import type { IChatImageAttachment } from '../types';

interface Props {
  modelValue: string;
  placeholder: string;
  suggestions: IPromptSuggestion[];
  loading: boolean;
  showModeIndicator: boolean;
  targetName: string;
  aiSuggestionsEnabled: boolean;
  attachments?: IChatImageAttachment[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:attachments': [value: IChatImageAttachment[]];
  'send': [];
  'suggestion-click': [suggestion: IPromptSuggestion];
  'clear-selection': [];
  'toggle-ai-suggestions': [];
}>();

const inputRef = ref<InstanceType<typeof CTextarea> | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null);

const attachmentsModel = computed<IChatImageAttachment[]>({
  get() {
    return props.attachments || [];
  },
  set(value) {
    emit('update:attachments', value);
  }
});

const isDragOver = ref(false);

const sendDisabled = computed(() => {
  const hasText = (props.modelValue || '').trim().length > 0;
  const hasUploading = (props.attachments || []).some(a => a.status === 'uploading');
  return props.loading || hasUploading || !hasText;
});

const onClickUpload = () => {
  if (props.loading) return;
  fileInputRef.value?.click();
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length) {
    imageUploadRef.value?.addFiles(files);
  }
  if (input) input.value = '';
};

const onPaste = (e: ClipboardEvent) => {
  if (props.loading) return;
  const items = Array.from(e.clipboardData?.items || []);
  const imageFiles = items
    .filter(it => it.kind === 'file' && (it.type || '').startsWith('image/'))
    .map(it => it.getAsFile())
    .filter((f): f is File => !!f);

  if (imageFiles.length) {
    e.preventDefault();
    imageUploadRef.value?.addFiles(imageFiles);
  }
};

const onDragEnter = () => {
  if (props.loading) return;
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = (e: DragEvent) => {
  isDragOver.value = false;
  if (props.loading) return;
  const files = Array.from(e.dataTransfer?.files || []).filter(f => (f.type || '').startsWith('image/'));
  if (files.length) {
    imageUploadRef.value?.addFiles(files);
  }
};

defineExpose({ inputRef });
</script>

<style scoped lang="scss">
.input-area-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 9px;
}

.drop-mask {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.16);
  border: 1px dashed rgba(64, 158, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
  z-index: 12;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
