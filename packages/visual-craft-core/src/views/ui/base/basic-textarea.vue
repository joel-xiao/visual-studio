<template>
  <textarea
    ref="textareaRef"
    class="basic-textarea"
    :value="modelValue"
    :rows="rows"
    v-bind="$attrs"
    @input="handleInput"
    @focus="onFocus"
    @blur="onBlur"
  ></textarea>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';

interface Props {
  modelValue?: string;
  rows?: number;
  autoSize?: boolean;
  maxHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  autoSize: false, // Auto resize by default for chat use case
  maxHeight: 120
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = async () => {
  if (!props.autoSize) return;
  const el = textareaRef.value;
  if (el) {
    el.style.height = 'auto';
    await nextTick();
    el.style.height = `${Math.min(el.scrollHeight, props.maxHeight)}px`;
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  adjustHeight();
};

const onFocus = (e: Event) => emit('focus', e);
const onBlur = (e: Event) => emit('blur', e);

watch(() => props.modelValue, () => {
  adjustHeight();
});

onMounted(() => {
  adjustHeight();
});

defineExpose({
    textarea: textareaRef
});
</script>

<style lang="scss">
#visual-craft-core .basic-textarea {
  width: 100%;
  color: var(--db-color-input);
  background: transparent;
  border: none;
  font-size: inherit;
  font-family: inherit;
  font-weight: 500;
  resize: none;
  line-height: 1.5;
  padding: 3px 6px;
  overflow-y: hidden;

  &::placeholder {
    font-weight: normal;
    opacity: 0.7;
    color: var(--theme-color-text-disabled);
  }

  &:disabled {
    color: var(--db-color-input-disabled-background);
    cursor: not-allowed;
  }

  &:focus {
      outline: none;
  }
}
</style>
