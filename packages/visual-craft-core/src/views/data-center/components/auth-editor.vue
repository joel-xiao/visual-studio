<template>
  <div class="auth-editor">
    <div class="auth-type-row">
      <span class="label">认证模式</span>
      <CSelect v-model="auth.type" :options="authOptions" size="small" style="width: 200px" />
    </div>

    <div v-if="auth.type === 'bearer'" class="auth-config">
      <div class="label">Token</div>
      <CInput v-model="auth.config.token" size="small" placeholder="Enter Token" />
    </div>

    <div v-if="auth.type === 'basic'" class="auth-config multi">
      <div class="field">
        <div class="label">用户名</div>
        <CInput v-model="auth.config.username" size="small" placeholder="Username" />
      </div>
      <div class="field">
        <div class="label">密码</div>
        <CInput v-model="auth.config.password" size="small" placeholder="Password" type="password" />
      </div>
    </div>

    <div v-if="auth.type === 'apikey'" class="auth-config multi">
      <div class="field">
        <div class="label">Key</div>
        <CInput v-model="auth.config.key" size="small" placeholder="Key" />
      </div>
      <div class="field">
        <div class="label">Value</div>
        <CInput v-model="auth.config.value" size="small" placeholder="Value" />
      </div>
      <div class="field">
        <div class="label">添加到</div>
        <CSelect v-model="auth.config.addIn" :options="addInOptions" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const auth = reactive(props.modelValue || { type: 'none', config: {} });

watch(() => props.modelValue, (newVal) => {
  Object.assign(auth, newVal);
}, { deep: true });

watch(auth, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const authOptions = [
  { label: 'Inherit from Parent', value: 'inherit' },
  { label: 'No Auth', value: 'none' },
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'Basic Auth', value: 'basic' },
  { label: 'API Key', value: 'apikey' }
];

const addInOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Query Params', value: 'query' }
];
</script>

<style lang="scss">
#visual-craft-core {
  .auth-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--theme-color-text);
    
    .label { 
      font-size: 12px; 
      color: var(--theme-color-text-secondary); 
      margin-bottom: 4px; 
    }
    
    .auth-type-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .auth-config {
      padding: 12px;
      background: var(--theme-color-tran-6);
      border-radius: 6px;
      border: 1px solid var(--theme-color-border);
      
      &.multi {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .field {
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
