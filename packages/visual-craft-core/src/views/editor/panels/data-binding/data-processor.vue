<template>
  <div class="data-processor">
    <div class="section-title">数据处理</div>
    
    <div class="proc-row">
      <n-checkbox v-model:checked="config.autoUpdate">自动更新请求</n-checkbox>
      <div v-if="config.autoUpdate" class="interval-ctrl">
        <n-input-number v-model:value="config.interval" size="small" :min="1" />
        <span>秒一次</span>
      </div>
    </div>

    <div class="proc-flow">
      <div class="flow-item">
        <div class="dot blue"></div>
        <div class="label">源数据</div>
        <div class="actions">
          <CButton size="small" @click="$emit('edit-static')">编辑静态数据</CButton>
          <CButton size="small" @click="$emit('config-source')">配置数据源</CButton>
        </div>
      </div>

      <div class="flow-item">
        <div class="dot gray"></div>
        <div class="label">数据过滤器</div>
        <n-switch v-model:value="showFilter" size="small" />
        <div class="actions">
          <CButton size="small" @click="$emit('config-filter')">配置过滤器</CButton>
        </div>
      </div>

      <div class="flow-item">
        <div class="dot blue"></div>
        <div class="label">数据响应结果（只读）</div>
        <Icon src="mdi:refresh" class="refresh-icon" button @click="$emit('refresh')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCheckbox, NInputNumber, NSwitch } from 'naive-ui';
import CButton from '@/views/ui/controls/c-button/index.vue';
import Icon from '@/components/icon/index.vue';

const props = defineProps<{
  config: any;
}>();

const showFilter = ref(false);
</script>

<style lang="scss" scoped>
.data-processor {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--theme-color-text);
  }

  .proc-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 13px;

    .interval-ctrl {
      display: flex;
      align-items: center;
      gap: 6px;
      .n-input-number { width: 80px; }
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

    .flow-item {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      gap: 12px;

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
        font-size: 12px;
        color: var(--theme-color-tran-70);
        flex: none;
      }

      .actions {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .refresh-icon { margin-left: 4px; }
    }
  }
}
</style>
