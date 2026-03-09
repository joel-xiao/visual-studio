<template>
  <div class="response-panel">
    <div class="panel-header">
      <div class="tabs">
        <div 
          v-for="t in tabs" 
          :key="t.id" 
          class="tab-item" 
          :class="{ active: activeTab === t.id }"
          @click="activeTab = t.id"
        >
          <span :data-text="t.name">{{ t.name }}</span>
        </div>
      </div>
      <div v-if="response" class="resp-meta">
         <span class="status" :class="{ success: response.status < 400 }">Status: {{ response.status }}</span>
         <span class="time">Time: {{ response.time }}ms</span>
      </div>
      <div class="actions">
        <CSelect v-model="viewType" :options="viewOptions" size="small" style="width: 80px" />
        <CButton quaternary size="small">Pretty</CButton>
      </div>
    </div>

    <div class="panel-content" v-if="response">
      <div v-if="activeTab === 'body'" class="body-view">
        <CCodeEditor 
          v-model="formattedBody" 
          language="json" 
          read-only 
          style="height: 100%" 
        />
      </div>
      <div v-else-if="activeTab === 'headers'" class="headers-view">
        <div v-for="(val, key) in response.headers" :key="key" class="header-row">
           <span class="key">{{ key }}:</span>
           <span class="val">{{ val }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
       <div class="empty-icon">
          <BasicIcon icon="mdi:console-line" font-size="48px" />
       </div>
       <div class="text">发送当前或全链路请求以查看结果</div>
       <div class="tip">在连带模式下，建议发送“测试全链路”以验证数据流</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const props = defineProps<{
  response: any;
}>();

const activeTab = ref('body');
const tabs = [
  { name: 'ResponseBody', id: 'body' },
  { name: 'ResponseHeaders', id: 'headers' }
];

const viewType = ref('json');
const viewOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'Raw', value: 'raw' },
  { label: 'Preview', value: 'preview' }
];

const formattedBody = computed(() => {
  if (!props.response || !props.response.body) return '';
  try {
    const data = props.response.results || props.response.body || props.response;
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(props.response.body || props.response);
  }
});
</script>

<style lang="scss" scoped>
.response-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-color-main);
  color: var(--theme-color-text);
  overflow: hidden;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    height: 48px;
    background: var(--db-main-color-left-bar-bg);
    border-bottom: 1px solid var(--db-main-border-black);
    flex: none;
    
    .tabs {
      display: flex;
      height: 100%;
      gap: 20px;
      .tab-item {
        padding: 0 4px;
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 13px;
        cursor: pointer;
        color: var(--theme-color-text-secondary);
        transition: all 0.2s;
        position: relative;

        &:hover { color: var(--theme-color-text); }
        
        span {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          &::before {
            content: attr(data-text);
            height: 0;
            visibility: hidden;
            overflow: hidden;
            user-select: none;
            font-weight: 600;
          }
        }
        
        &.active {
          color: var(--theme-color-text-bold);
          span { font-weight: 600; }
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--db-editor-color-primary);
          }
        }
      }
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }

    .resp-meta {
      display: flex;
      gap: 16px;
      margin-left: auto;
      margin-right: 20px;
      font-size: 12px;
      .status { 
        font-weight: 700; color: #f87171; 
        &.success { color: #52c41a; }
      }
      .time { color: var(--theme-color-text-secondary); opacity: 0.8; }
    }
  }

  .panel-content {
    flex: 1;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
    
    .body-view {
      flex: 1;
      overflow: hidden;
    }

    .headers-view {
      padding: 16px;
      overflow-y: auto;
    }
    
    .header-row {
      display: flex;
      gap: 8px;
      font-size: 12px;
      margin-bottom: 8px;
      .key { color: var(--theme-color-text-secondary); font-weight: 600; }
      .val { color: var(--theme-color-text); }
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--theme-color-text-secondary);
    opacity: 0.6;
    gap: 12px;

    .empty-icon {
      color: var(--theme-color-gray-400);
      margin-bottom: 8px;
    }
    .text {
      font-size: 14px;
      font-weight: 600;
    }
    .tip {
      font-size: 12px;
    }
  }
}
</style>
