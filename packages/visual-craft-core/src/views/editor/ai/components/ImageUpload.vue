<template>
  <div v-if="items.length" class="image-upload">
    <div class="image-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="image-item"
        :class="{ disabled: disabled, uploading: item.status === 'uploading', error: item.status === 'error' }"
      >
        <img v-if="item.url" class="image" :src="item.url" />
        <div v-else class="image-placeholder"></div>
        <button
          class="remove-btn"
          :disabled="disabled || item.status === 'uploading'"
          type="button"
          @click.stop="onRemove(item.id)"
        >
          <CIcon icon="mdi:close" size="small" />
        </button>
        <div v-if="item.status === 'uploading'" class="status-mask">
          <CIcon icon="mdi:loading" :spin="true" />
        </div>
        <div v-else-if="item.status === 'error'" class="status-mask">
          <CIcon icon="mdi:alert-circle-outline" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CIcon from '../../../ui/controls/c-icon/index.vue';
import type { IChatImageAttachment } from '../types';

interface Props {
  modelValue?: IChatImageAttachment[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: IChatImageAttachment[]];
}>();

const items = computed(() => props.modelValue || []);

const fileToDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};

const updateItem = (id: string, patch: Partial<IChatImageAttachment>) => {
  const next = items.value.map(it => (it.id === id ? { ...it, ...patch } : it));
  emit('update:modelValue', next);
};

const addFiles = async (files: File[] | FileList) => {
  if (props.disabled) return;
  const list = Array.from(files || []).filter(f => (f.type || '').startsWith('image/'));
  if (!list.length) return;

  const baseItems = items.value.slice();
  const pending = list.map(file => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      id,
      kind: 'image' as const,
      url: '',
      name: file.name,
      mimeType: file.type,
      size: file.size,
      status: 'uploading' as const
    };
  });

  emit('update:modelValue', [...baseItems, ...pending]);

  await Promise.all(
    pending.map(async (p, idx) => {
      const file = list[idx];
      try {
        const url = await fileToDataUrl(file);
        updateItem(p.id, { url, status: 'ready' });
      } catch {
        updateItem(p.id, { status: 'error' });
      }
    })
  );
};

const onRemove = (id: string) => {
  if (props.disabled) return;
  emit(
    'update:modelValue',
    items.value.filter(it => it.id !== id)
  );
};

defineExpose({ addFiles });
</script>

<style scoped lang="scss">
.image-upload {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.error {
    border-color: rgba(244, 63, 94, 0.35);
  }
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: rgba(255, 255, 255, 0.9);

  &:disabled {
    cursor: not-allowed;
    opacity: 0;
  }

  :deep(.c-icon) {
    width: 12px;
    height: 12px;
  }
}

.image-item:hover .remove-btn {
  opacity: 1;
}

.status-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.9);
}
</style>
