<template>
  <div class="data-processor">
    <div class="section-title">数据处理</div>
    
    <div class="proc-row">
      <CLiteSwitch v-model:model-value="config.autoUpdate" content="自动更新请求" />
      <div v-if="config.autoUpdate" class="interval-ctrl">
        <CInput v-model:model-value="config.interval" size="mini" style="width: 48px" />
        <span class="unit">秒一次</span>
      </div>
    </div>

    <div class="proc-flow">
      <div class="flow-step">
        <div class="flow-item">
          <div class="dot blue"></div>
          <div class="label">源数据</div>
          <div class="actions">
            <CButton size="small" @click="$emit('edit-static')">编辑静态数据</CButton>
            <CButton size="small" @click="$emit('config-source')">配置数据源</CButton>
          </div>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-item">
          <div class="dot gray"></div>
          <div class="label">数据过滤器</div>
          <CLiteSwitch v-model:model-value="showFilter" />
          <div class="actions">
            <CButton size="small" @click="$emit('config-filter')">配置过滤器</CButton>
          </div>
        </div>
      </div>

      <div class="flow-item">
        <div class="dot blue"></div>
        <div class="label">数据响应结果（只读）</div>
        <CIcon icon="mdi:refresh" class="refresh-icon" type="button" size="small" @click="$emit('refresh')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import CLiteSwitch from '@/views/ui/controls/c-lite-switch/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CIcon from '@/views/ui/controls/c-icon/index.vue';

const props = defineProps<{
  config: any;
}>();

const showFilter = ref(false);
</script>

<style lang="scss" scoped>
.data-processor {
  .section-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--theme-color-text);
    opacity: 0.8;
  }

  .proc-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 12px;

    .interval-ctrl {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      
      .unit {
        color: var(--theme-color-tran-45);
        font-size: 11px;
      }
    }
  }

  .proc-flow {
    position: relative;
    padding-left: 20px;

    &::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 10px;
      bottom: 20px;
      width: 1px;
      background: #3662ec;
      opacity: 0.3;
    }

    .flow-step {
      margin-bottom: 16px;
    }

    .flow-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;

      .dot {
        position: absolute;
        left: -20px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #3662ec;
        &.gray { background: #666; }
      }

      .label {
        font-size: 11px;
        color: var(--theme-color-tran-70);
        flex: none;
        white-space: nowrap;
      }

      .actions {
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-end;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }

      .refresh-icon { margin-left: auto; }
    }
  }
}
</style>
