<template>
  <div class="connection-config">
    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:database-settings-outline" font-size="16px" class="section-icon" />
        数据库类型
      </div>
      <div class="db-type-grid">
        <div 
          v-for="db in dbTypes" 
          :key="db.value" 
          class="db-type-card"
          :class="{ active: modelValue.dbType === db.value }"
          @click="update('dbType', db.value)"
        >
          <div class="icon-box" :style="{ background: db.bgColor, color: db.color }">
            <BasicIcon :icon="db.icon" font-size="22px" />
          </div>
          <div class="db-name">{{ db.label }}</div>
          <div class="db-desc">{{ db.desc }}</div>
          <div v-if="modelValue.dbType === db.value" class="check-mark">
            <BasicIcon icon="mdi:check-circle" font-size="16px" />
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:lan-connect" font-size="16px" class="section-icon" />
        连接配置
      </div>
      <div class="form-grid">
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:server-network" font-size="13px" /> 主机地址 <span class="required">*</span></div>
            <div class="input-wrap">
              <CInput icon="mdi:ip-network-outline" :model-value="modelValue.host" placeholder="localhost / 192.168.1.100" @update:model-value="(v: string) => update('host', v)" />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:numeric" font-size="13px" /> 端口 <span class="required">*</span></div>
            <div class="input-wrap port-wrap">
              <CInput icon="mdi:ethernet" :model-value="modelValue.port" :placeholder="defaultPort" @update:model-value="(v: string) => update('port', v)" />
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="label"><BasicIcon icon="mdi:database-outline" font-size="13px" /> 数据库名 <span class="required">*</span></div>
          <div class="input-wrap">
            <CInput icon="mdi:database-marker-outline" :model-value="modelValue.database" placeholder="my_database" @update:model-value="(v: string) => update('database', v)" />
          </div>
        </div>
        <div class="form-row-group">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:account-outline" font-size="13px" /> 用户名 <span class="required">*</span></div>
            <div class="input-wrap">
              <CInput icon="mdi:account-key-outline" :model-value="modelValue.username" placeholder="root" @update:model-value="(v: string) => update('username', v)" />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:lock-outline" font-size="13px" /> 密码</div>
            <div class="input-wrap">
              <CInput icon="mdi:form-textbox-password" :model-value="modelValue.password" placeholder="••••••••" type="password" @update:model-value="(v: string) => update('password', v)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="section-title">
        <BasicIcon icon="mdi:tune-variant" font-size="16px" class="section-icon" />
        高级选项
      </div>
      <div class="form-grid">
        <div class="form-row-group triple">
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:timer-sand" font-size="13px" /> 超时 (秒)</div>
            <div class="input-wrap">
              <CInput icon="mdi:clock-outline" :model-value="modelValue.timeout" placeholder="30" suffix="s" @update:model-value="(v: string) => update('timeout', v)" />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:translate" font-size="13px" /> 字符集</div>
            <div class="input-wrap">
              <CSelect icon="mdi:format-letter-case" :model-value="modelValue.charset || 'utf8mb4'" :options="charsetOptions" @update:model-value="(v: string) => update('charset', v)" />
            </div>
          </div>
          <div class="form-row">
            <div class="label"><BasicIcon icon="mdi:shield-lock-outline" font-size="13px" /> SSL</div>
            <div class="input-wrap">
              <div class="toggle-switch" :class="{ active: modelValue.ssl }" @click="update('ssl', !modelValue.ssl)">
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <label>{{ modelValue.ssl ? '已启用' : '未启用' }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="label"><BasicIcon icon="mdi:link-variant" font-size="13px" /> 连接字符串</div>
          <div class="input-wrap full">
            <CInput icon="mdi:code-string" :model-value="connectionString" :lock="true" placeholder="自动生成" />
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <CButton primary size="small" icon="mdi:connection" @click="$emit('test-connection')">
        测试连接
      </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  modelValue: {
    dbType: string;
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
    timeout: string;
    charset: string;
    ssl: boolean;
  }
}>();

const emit = defineEmits(['update:modelValue', 'test-connection']);

const dbTypes = [
  { value: 'mysql', label: 'MySQL', desc: '最流行的开源关系型数据库', icon: 'mdi:database', color: '#00758F', bgColor: 'rgba(0, 117, 143, 0.1)' },
  { value: 'postgresql', label: 'PostgreSQL', desc: '先进的开源对象关系型数据库', icon: 'mdi:elephant', color: '#336791', bgColor: 'rgba(51, 103, 145, 0.1)' },
  { value: 'oracle', label: 'Oracle', desc: '企业级商业关系型数据库', icon: 'mdi:database-lock', color: '#F80000', bgColor: 'rgba(248, 0, 0, 0.08)' },
  { value: 'sqlserver', label: 'SQL Server', desc: '微软企业级数据库引擎', icon: 'mdi:microsoft', color: '#CC2927', bgColor: 'rgba(204, 41, 39, 0.08)' }
];

const charsetOptions = [
  { label: 'utf8mb4', value: 'utf8mb4' },
  { label: 'utf8', value: 'utf8' },
  { label: 'latin1', value: 'latin1' },
  { label: 'gbk', value: 'gbk' },
  { label: 'gb2312', value: 'gb2312' }
];

const defaultPort = computed(() => {
  const map: Record<string, string> = {
    mysql: '3306',
    postgresql: '5432',
    oracle: '1521',
    sqlserver: '1433'
  };
  return map[props.modelValue.dbType] || '3306';
});

const connectionString = computed(() => {
  const { dbType, host, port, database, username } = props.modelValue;
  if (!host) return '';
  const p = port || defaultPort.value;
  if (dbType === 'mysql') return `mysql://${username || 'root'}@${host}:${p}/${database || ''}`;
  if (dbType === 'postgresql') return `postgresql://${username || 'postgres'}@${host}:${p}/${database || ''}`;
  if (dbType === 'oracle') return `oracle://${username || 'system'}@${host}:${p}/${database || ''}`;
  if (dbType === 'sqlserver') return `sqlserver://${username || 'sa'}@${host}:${p};database=${database || ''}`;
  return `${dbType}://${host}:${p}/${database}`;
});

function update(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style lang="scss" scoped>
.connection-config {
  padding: 32px;
  overflow-y: auto;
  height: 100%;
  background: var(--db-editor-color-panel-bg);

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
        color: var(--sql-color-primary); 
      }
    }
  }

  .db-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .db-type-card {
    padding: 16px;
    background: var(--db-main-color-card-bg);
    border: 1px solid var(--theme-color-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    position: relative;

    .icon-box {
      width: 48px;
      height: 48px;
      margin: 0 auto 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: transform 0.2s;
    }

    .db-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-color-text-bold);
      margin-bottom: 4px;
    }

    .db-desc {
      font-size: 11px;
      color: var(--theme-color-text-secondary);
      opacity: 0.7;
      line-height: 1.4;
    }

    .check-mark {
      position: absolute;
      top: 8px;
      right: 8px;
      color: var(--sql-color-primary);
    }

    &:hover {
      border-color: var(--sql-color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--sql-color-primary-light);
      .icon-box { transform: scale(1.05); }
    }

    &.active {
      border-color: var(--sql-color-primary);
      background: var(--sql-color-primary-light);
      box-shadow: 0 0 0 3px var(--sql-color-primary-light);
      .db-name { color: var(--sql-color-primary); }
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
      .toggle-track { background: var(--sql-color-primary); }
      .toggle-thumb { left: 14px; }
      label { color: var(--theme-color-text-bold); font-weight: 600; }
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    padding-top: 10px;
    :deep(.c-button) {
      background: var(--sql-color-primary) !important;
      border-color: var(--sql-color-primary) !important;
      color: #000;
      font-weight: 800;
      &:hover { opacity: 0.9; box-shadow: 0 2px 8px var(--sql-color-primary-light); }
    }
  }
}
</style>
