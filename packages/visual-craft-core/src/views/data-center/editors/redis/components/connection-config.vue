<template>
  <div class="redis-connection-config">
    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:database-settings-outline" font-size="16px" class="section-icon" />
        Redis 服务器地址
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:server-network" font-size="13px" /> 服务器地址 <span class="required">*</span></div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:ip-network-outline"
                :model-value="modelValue.host" 
                placeholder="127.0.0.1" 
                @update:model-value="(v: string) => update('host', v)"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:numeric" font-size="13px" /> 端口 <span class="required">*</span></div>
            <div class="input-wrap port-wrap">
              <CInput 
                icon="mdi:ethernet"
                :model-value="String(modelValue.port)" 
                placeholder="6379" 
                @update:model-value="(v: string) => update('port', Number(v))"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:account-key-outline" font-size="16px" class="section-icon" />
        安全认证 (Auth)
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:account-outline" font-size="13px" /> 用户名 (Redis 6+)</div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:account-circle-outline"
                :model-value="modelValue.username" 
                placeholder="Username" 
                @update:model-value="(v: string) => update('username', v)"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:lock-outline" font-size="13px" /> 密码</div>
            <div class="input-wrap">
              <CInput 
                icon="mdi:form-textbox-password"
                :model-value="modelValue.password" 
                type="password"
                placeholder="Password" 
                @update:model-value="(v: string) => update('password', v)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:tune-variant" font-size="16px" class="section-icon" />
        高级连接参数
      </div>
      <div class="form-grid">
        <div class="form-row-group triple">
          <div class="form-row">
             <div class="label"><BasicIcon icon="mdi:database" font-size="13px" /> DB 索引</div>
             <div class="input-wrap">
               <CInput icon="mdi:numeric" :model-value="String(modelValue.db)" @update:model-value="(v: string) => update('db', Number(v))" />
             </div>
          </div>
          <div class="form-row">
             <div class="label"><BasicIcon icon="mdi:shield-lock-outline" font-size="13px" /> SSL 连接</div>
             <div class="input-wrap">
                <div class="toggle-switch" :class="{ active: modelValue.ssl }" @click="update('ssl', !modelValue.ssl)">
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                  <label>{{ modelValue.ssl ? '已启用' : '未启用' }}</label>
                </div>
             </div>
          </div>
          <div class="form-row">
             <div class="label"><BasicIcon icon="mdi:timer-sand" font-size="13px" /> 超时时间</div>
             <div class="input-wrap">
               <CInput icon="mdi:clock-outline" :model-value="String(modelValue.timeout)" suffix="ms" @update:model-value="(v: string) => update('timeout', Number(v))" />
             </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
       <CButton primary size="small" icon="mdi:lightning-bolt" @click="$emit('test-connection')">
         测试 Redis 连通性
       </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'test-connection']);

function update(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style lang="scss" scoped>
.redis-connection-config {
  padding: 32px;
  background: var(--db-editor-color-panel-bg);
  height: 100%;
  overflow-y: auto;

  .config-section {
    margin-bottom: 36px;
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      .section-icon { 
        color: var(--redis-color-primary); 
      }
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    &.triple {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color-text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      .required { color: #f5222d; font-size: 11px; }
    }

    .input-wrap {
      &.port-wrap { max-width: 200px; }
      &.full { width: 100%; }
    }
  }

  .toggle-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    height: 32px;

    .toggle-track {
      width: 28px;
      height: 16px;
      background: var(--theme-color-gray-300);
      border-radius: 10px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex: none;
      .toggle-thumb {
        position: absolute;
        left: 2px;
        top: 2px;
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
    }

    label {
      font-size: 12px;
      color: var(--theme-color-text-secondary);
      cursor: pointer;
    }

    &.active {
      .toggle-track { background: var(--redis-color-primary); }
      .toggle-thumb { left: 14px; }
      label { color: var(--theme-color-text-bold); font-weight: 600; }
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    padding-top: 10px;
    :deep(.c-button) {
      background: var(--redis-color-primary) !important;
      border-color: var(--redis-color-primary) !important;
      color: #fff;
      font-weight: 800;
      &:hover { opacity: 0.9; box-shadow: 0 2px 8px var(--redis-color-primary-light); }
    }
  }
}
</style>
