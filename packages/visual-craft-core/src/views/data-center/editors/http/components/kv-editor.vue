<template>
  <div class="kv-editor-light">
    <div class="header-row">
      <div class="col key">{{ labelKey }}</div>
      <div class="col val">{{ labelValue }}</div>
      <div class="col desc">{{ labelDesc }}</div>
      <div class="col actions">
        <CButton 
          quaternary 
          size="small" 
          icon="mdi:plus" 
          title="添加行"
          @click="addRow" 
        />
      </div>
    </div>
    
    <div class="rows-container">
      <div v-for="(item, index) in localItems" :key="index" class="kv-row">
        <div class="col key">
          <CInput v-model="item.key" placeholder="Key" @input="onInput" />
        </div>
        <div class="col val">
          <CInput v-model="item.value" placeholder="Value" @input="onInput" />
        </div>
        <div class="col desc">
          <CInput v-model="item.description" placeholder="Description" @input="onInput" />
        </div>
        <div class="col actions">
          <CButton 
            quaternary 
            size="small" 
            icon="mdi:delete-outline" 
            class="del-btn"
            @click="removeRow(index)"
            :disabled="localItems.length <= 1"
          />
        </div>
      </div>
    </div>
    <div class="add-row-action" @click="addRow">
      <BasicIcon icon="mdi:plus" />
      <span>添加新参数</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = withDefaults(defineProps<{
  modelValue: any[];
  labelKey?: string;
  labelValue?: string;
  labelDesc?: string;
}>(), {
  modelValue: () => [{ key: '', value: '', description: '', enabled: true }],
  labelKey: '字段名',
  labelValue: '值',
  labelDesc: '描述'
});

const emit = defineEmits(['update:modelValue']);

const localItems = ref<any[]>([]);

watch(() => props.modelValue, (val) => {
  localItems.value = JSON.parse(JSON.stringify(val));
}, { immediate: true, deep: true });

function onInput() {
  emit('update:modelValue', localItems.value);
}

function addRow() {
  localItems.value.push({ key: '', value: '', description: '', enabled: true });
  emit('update:modelValue', localItems.value);
}

function removeRow(index: number) {
  if (localItems.value.length > 1) {
    localItems.value.splice(index, 1);
  } else {
    localItems.value[0] = { key: '', value: '', description: '', enabled: true };
  }
  emit('update:modelValue', localItems.value);
}
</script>

<style lang="scss" scoped>
.kv-editor-light {
  border: 1px solid var(--theme-color-border);
  border-radius: var(--border-radius-4);
  overflow: hidden;

  .header-row {
    display: flex;
    background: var(--db-main-color-left-bar-bg);
    height: 36px;
    align-items: center;
    border-bottom: 1px solid var(--theme-color-border);
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    font-weight: 700;
  }

  .kv-row {
    display: flex;
    height: 48px;
    align-items: center;
    border-bottom: 1px solid var(--theme-color-border);
    &:last-child { border-bottom: none; }
  }

  .col {
    padding: 0 12px;
    border-right: 1px solid var(--theme-color-border);
    height: 100%;
    display: flex;
    align-items: center;
    &:last-child { border-right: none; }
    
    &.key { flex: 1; }
    &.val { flex: 1.5; }
    &.desc { flex: 2; }
    &.actions { width: 80px; justify-content: center; color: var(--theme-color-gray-700); }
    
    :deep(.basic-box) { border: none !important; background: transparent !important; }
    :deep(input) { font-size: 12px; color: var(--theme-color-text); }
    
    .c-button {
      color: var(--theme-color-text-secondary);
      transition: all 0.2s;
      :deep(.basic-icon) { color: inherit; }
      &:hover:not(:disabled) { color: var(--theme-color-blue-700); }
    }
  }

  .add-row-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    font-size: 12px;
    color: var(--theme-color-text-secondary);
    background: var(--theme-color-gray-50);
    cursor: pointer;
    border-top: 1px dashed var(--theme-color-border);
    transition: all 0.2s;
    
    :deep(.basic-icon) { color: inherit; }
    
    &:hover {
      background: var(--theme-color-gray-100);
      color: var(--theme-color-blue-700);
    }
    
    .basic-icon { font-size: 14px; }
  }

  .del-btn {
    opacity: 0.5;
    transition: all 0.2s;
    :deep(.basic-icon) { color: inherit; }
    
    &:hover:not(:disabled) { 
      opacity: 1; 
      color: var(--db-main-color-post); 
    }
  }
}
</style>
