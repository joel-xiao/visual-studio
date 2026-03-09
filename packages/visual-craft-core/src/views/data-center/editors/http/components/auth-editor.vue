<template>
  <div class="auth-editor">
    <!-- 1. Selection Cards -->
    <div class="auth-type-grid">
      <div
        v-for="opt in authOptions"
        :key="opt.value"
        class="auth-card"
        :class="{ active: auth.type === opt.value }"
        @click="auth.type = opt.value"
      >
        <div class="card-icon">
          <BasicIcon :icon="getIcon(opt.value)" font-size="20px" />
        </div>
        <div class="card-info">
          <div class="card-label">{{ opt.label }}</div>
          <div class="card-sub">{{ getSublabel(opt.value) }}</div>
        </div>
        <div v-if="auth.type === opt.value" class="active-check">
          <BasicIcon icon="mdi:check-circle" font-size="16px" />
        </div>
      </div>
    </div>

    <!-- 2. Dynamic Config Content -->
    <div class="auth-content-area">
      <!-- Inherit Preview -->
      <transition name="fade">
        <div v-if="auth.type === 'inherit'" class="inherit-status-box">
          <div v-if="globalAuth && globalAuth.type !== 'none'" class="status-active">
            <div class="status-icon"><BasicIcon icon="mdi:link-variant" /></div>
            <div class="status-body">
              <div class="main-text">已继承全局认证</div>
              <div class="type-badge">{{ globalAuth.type?.toUpperCase() }}</div>
            </div>
          </div>
          <div v-else class="status-empty">
            <BasicIcon icon="mdi:alert-circle-outline" font-size="24px" />
            <span>全局配置中尚未定义任何认证方式</span>
          </div>
        </div>
      </transition>

      <!-- Bearer -->
      <div v-if="auth.type === 'bearer'" class="config-inputs">
        <div class="form-item">
          <label>Token (Bearer String)</label>
          <CInput
            v-model="auth.config.token"
            icon="mdi:fingerprint"
            placeholder="Bearer eyJhbG... 或 {{token}}"
          />
        </div>
      </div>

      <!-- Basic -->
      <div v-if="auth.type === 'basic'" class="config-inputs grid-2">
        <div class="form-item">
          <label>用户名 (Username)</label>
          <CInput
            v-model="auth.config.username"
            icon="mdi:account-outline"
            placeholder="Username"
          />
        </div>
        <div class="form-item">
          <label>密码 (Password)</label>
          <CInput
            v-model="auth.config.password"
            icon="mdi:lock-outline"
            placeholder="Password"
            type="password"
          />
        </div>
      </div>

      <!-- API Key -->
      <div v-if="auth.type === 'apikey'" class="config-inputs grid-3">
        <div class="form-item">
          <label>键名 (Key)</label>
          <CInput
            v-model="auth.config.key"
            icon="mdi:label-outline"
            placeholder="Header Name"
          />
        </div>
        <div class="form-item">
          <label>键值 (Value)</label>
          <CInput
            v-model="auth.config.value"
            icon="mdi:text-short"
            placeholder="Value"
          />
        </div>
        <div class="form-item">
          <label>位置 (Add To)</label>
          <CSelect v-model="auth.config.addIn" :options="addInOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  modelValue: any;
  globalAuth?: any;
}>();

const emit = defineEmits(['update:modelValue']);

const auth = reactive(props.modelValue || { type: 'inherit', config: {} });

watch(() => props.modelValue, (newVal) => {
  if (newVal) Object.assign(auth, newVal);
}, { deep: true, immediate: true });

watch(auth, (newVal) => {
  emit('update:modelValue', { ...newVal });
}, { deep: true });

const authOptions = [
  { label: '继承全局', value: 'inherit' },
  { label: 'Bearer', value: 'bearer' },
  { label: 'Basic', value: 'basic' },
  { label: 'API Key', value: 'apikey' },
  { label: '无认证', value: 'none' }
];

const addInOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Query Params', value: 'query' }
];

function getIcon(type: string) {
  const map: Record<string, string> = {
    inherit: 'mdi:link-variant',
    bearer: 'mdi:key-outline',
    basic: 'mdi:account-key-outline',
    apikey: 'mdi:shield-key-outline',
    none: 'mdi:eye-off-outline'
  };
  return map[type] || 'mdi:shield-outline';
}

function getSublabel(type: string) {
  const map: Record<string, string> = {
    inherit: '使用全局配置',
    bearer: 'Token 字符串',
    basic: '用户/密码',
    apikey: '自定义键值',
    none: '匿名请求'
  };
  return map[type] || '';
}
</script>

<style lang="scss" scoped>
.auth-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;

  .auth-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;

    .auth-card {
      position: relative;
      padding: 12px;
      background: var(--theme-color-tran-4);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(.active) {
        border-color: var(--theme-color-blue-400);
        background: var(--theme-color-tran-8);
        transform: translateY(-2px);
      }

      &.active {
        background: rgba(54, 98, 236, 0.12);
        border-color: var(--theme-color-blue-700);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        &:hover {
           background: rgba(54, 98, 236, 0.18);
           transform: translateY(-2px);
        }

        .card-icon {
          color: var(--theme-color-blue-700);
          background: rgba(54, 98, 236, 0.2);
        }
        .card-label { color: var(--theme-color-blue-700); font-weight: 700; }
        .active-check { color: var(--theme-color-blue-700); }
      }

      .card-icon {
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: var(--theme-color-gray-200);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--theme-color-text-secondary);
        transition: all 0.2s;
      }

      .card-info {
        flex: 1;
        min-width: 0;
        .card-label { font-size: 13px; line-height: 1.2; margin-bottom: 2px; }
        .card-sub { font-size: 11px; opacity: 0.5; color: var(--theme-color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      }

      .active-check {
        position: absolute;
        top: 4px;
        right: 4px;
      }
    }
  }

  .auth-content-area {
    min-height: 80px;

    .inherit-status-box {
      background: rgba(var(--theme-color-blue-rgb), 0.03);
      border: 1px dashed var(--theme-color-border-bold);
      border-radius: 10px;
      padding: 20px;

      .status-active {
        display: flex;
        align-items: center;
        gap: 16px;

        .status-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--theme-color-blue-700);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 10px rgba(54, 98, 236, 0.3);
        }

        .status-body {
          .main-text { font-size: 14px; font-weight: 700; color: var(--theme-color-text-bold); margin-bottom: 4px; }
          .type-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            background: rgba(54, 98, 236, 0.1);
            color: var(--theme-color-blue-700);
            border-radius: 4px;
          }
        }
      }

      .status-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--theme-color-text-secondary);
        opacity: 0.6;
        font-size: 13px;
        padding: 10px 0;
      }
    }

    .config-inputs {
      display: flex;
      flex-direction: column;
      gap: 16px;

      &.grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
      &.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; }

      .form-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        label { font-size: 12px; font-weight: 600; color: var(--theme-color-text-secondary); }
      }
    }
  }

  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
}
</style>
