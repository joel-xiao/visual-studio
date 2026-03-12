<template>
  <div id="visual-craft-core" class="data-center-frame">
    <!-- Sidebar -->
    <div v-if="viewMode === 'home'" class="data-center-sider">
      <div class="sider-header">
         <span class="title">数据中心</span>
      </div>
      <div class="folder-list">
        <div 
          v-for="folder in DATA_CENTER_CONFIG.folderTree" 
          :key="folder.id"
          class="folder-item"
          :class="{ active: currentFolderId === folder.id }"
          @click="currentFolderId = folder.id"
        >
          <BasicIcon icon="mdi:folder-outline" font-size="16px" />
          <span class="name" :data-text="folder.name">{{ folder.name }}</span>
          <span v-if="folder.sum" class="count">{{ folder.sum }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="data-center-main">
      <div v-if="viewMode === 'home'" class="main-scroll-wrapper">
        <HomePanel 
          @new="onStartAdd"
          @edit="onEditSource"
          @delete="onDeleteSource"
          @select-plugin="onConnectorSelect"
          @import="onImport"
          @export="onExport"
        />
      </div>

      <!-- Full Screen Editors (No sidebar when editing) -->
      <div v-else class="full-screen-editor-container">
        <!-- Editor Header -->
        <div class="editor-nav-bar">
          <div class="nav-left">
            <div class="back-link" @click="setViewMode('home')">
               <BasicIcon icon="mdi:chevron-left" font-size="20px" />
               <span>返回列表</span>
            </div>
            <div class="divider"></div>
            <div class="nav-title">
                {{ viewMode === 'http-editor' ? 'HTTP 接口编辑器' : viewMode === 'sql-editor' ? '数据库查询编辑器' : viewMode === 'mqtt-editor' ? 'MQTT 物联网编辑器' : viewMode === 'redis-editor' ? 'Redis 缓存编辑器' : viewMode === 'websocket-editor' ? 'WebSocket 配置中心' : viewMode === 'modbus-editor' ? 'Modbus 工业协议终端' : '协议接入配置' }}
               <span class="sub">- {{ editingSource?.name }}</span>
            </div>
          </div>
          <div class="nav-right">
            <CButton quaternary size="small" class="cancel-btn" @click="setViewMode('home')">取消</CButton>
            <CButton primary size="small" class="theme-btn" @click="onSave">保存发布</CButton>
          </div>
        </div>

        <div class="editor-content-viewport">
          <HttpEditor 
            ref="editorRef"
            v-if="viewMode === 'http-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <SqlEditor
            ref="editorRef"
            v-if="viewMode === 'sql-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <MqttEditor
            ref="editorRef"
            v-if="viewMode === 'mqtt-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <RedisEditor
            ref="editorRef"
            v-if="viewMode === 'redis-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <WebsocketEditor
            ref="editorRef"
            v-if="viewMode === 'websocket-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <ModbusEditor
            ref="editorRef"
            v-if="viewMode === 'modbus-editor'"
            :initial-data="editingSource"
            :response="response"
            @save="onSaveSource"
            @test="onTest"
          />
          <WizardPanel 
            v-if="viewMode === 'wizard-editor'"
            :initial-data="editingSource"
            @save="onSaveSource"
            @cancel="setViewMode('home')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import HomePanel from './panels/home-panel.vue';
import HttpEditor from './editors/http/index.vue';
import SqlEditor from './editors/sql/index.vue';
import MqttEditor from './editors/mqtt/index.vue';
import RedisEditor from './editors/redis/index.vue';
import WebsocketEditor from './editors/websocket/index.vue';
import ModbusEditor from './editors/modbus/index.vue';
import WizardPanel from './panels/wizard-panel.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

import { useDataCenterContext, removeDataCenterContext } from './hooks/data-center-context';
import { DATA_CENTER_CONFIG } from './config';

const props = defineProps<{
    dataSourceList?: any[];
    response?: any;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
  (e: 'test', data: any): void;
  (e: 'delete', id: string): void;
  (e: 'import'): void;
  (e: 'export'): void;
}>();

const editorRef = ref<any>(null);
const currentFolderId = ref('all');
const { 
  viewMode,
  editingSource,
  // dataSourceList, // Remove this line
  setViewMode, 
  setEditingSource, 
  setDataSourceList,
  addDataSource,
  updateDataSource,
  deleteDataSource
} = useDataCenterContext();

// Sync props to context
watch(() => props.dataSourceList, (list) => {
  if (list && list.length > 0) setDataSourceList(list);
}, { immediate: true });

onUnmounted(() => {
  removeDataCenterContext();
});

function onStartAdd() {
  setEditingSource({ 
    name: '新建 API 接口', 
    type: 'api',
    method: 'GET', 
    url: '', 
    steps: [
      {
        id: 'main',
        name: '步骤 1',
        method: 'GET',
        url: '',
        headers: [],
        bodyMode: 'none'
      }
    ],
    transformation: { script: 'return results.main.data', type: 'raw' }
  });
  setViewMode('http-editor');
}

function onEditSource(source: any) {
  setEditingSource(JSON.parse(JSON.stringify(source))); // Deep copy for editing
  if (source.type === 'sql') {
    setViewMode('sql-editor');
  } else if (source.type === 'mqtt') {
    setViewMode('mqtt-editor');
  } else if (source.type === 'redis') {
    setViewMode('redis-editor');
  } else if (source.type === 'websocket') {
    setViewMode('websocket-editor');
  } else if (source.type === 'modbus') {
    setViewMode('modbus-editor');
  } else if (source.type === 'api' || !source.type) {
    setViewMode('http-editor');
  } else {
    setViewMode('wizard-editor');
  }
}

function onDeleteSource(id: string) {
  deleteDataSource(id);
  emit('delete', id);
}

function onConnectorSelect(connector: any) {
  if (connector.id === 'sql') {
    setEditingSource({
      name: '新建数据库查询',
      type: 'sql',
      connection: { dbType: 'mysql', host: '', port: '', database: '', username: '', password: '', timeout: '30', charset: 'utf8mb4', ssl: false },
      variables: [{ key: '', value: '', description: '', enabled: true }],
      steps: [{ id: 'query1', name: '查询 1', queryType: 'raw', sql: 'SELECT * FROM table_name LIMIT 100', condition: '', transformation: { script: 'return data;', type: 'raw' } }],
      transformation: { script: 'return results.query1;', type: 'raw' }
    });
    setViewMode('sql-editor');
  } else if (connector.id === 'api') {
    setEditingSource({ 
      name: '新建' + connector.name, 
      type: connector.id,
      method: 'GET',
      url: '',
      steps: [{ id: 'main', name: '步骤 1', method: 'GET', url: '', headers: [], bodyMode: 'none' }]
    });
    setViewMode('http-editor');
  } else if (connector.id === 'mqtt') {
    setEditingSource({
      name: '新建 MQTT 连接',
      type: 'mqtt',
      connection: { brokerUrl: '', port: 1883, username: '', password: '', clientId: 'client_' + Math.random().toString(36).substr(2, 5) },
      variables: [{ key: '', value: '', description: '', enabled: true }],
      steps: [{ id: 'step1', name: '发布/订阅 1', action: 'publish', topic: '', qos: 1, payload: '{}', condition: '', transformation: { script: 'return data;', type: 'raw' } }],
      transformation: { script: 'return results.step1;', type: 'raw' }
    });
    setViewMode('mqtt-editor');
  } else if (connector.id === 'redis') {
    setEditingSource({
      name: '新建 Redis 操作',
      type: 'redis',
      connection: { host: '127.0.0.1', port: 6379, username: '', password: '', db: 0, ssl: false, timeout: 5000 },
      variables: [{ key: '', value: '', description: '', enabled: true }],
      steps: [{ id: 'cmd1', name: '命令 1', actionType: 'raw', command: 'GET my_key', condition: '', variables: [{ key: '', value: '', description: '', enabled: true }], transformation: { script: 'return data;', type: 'raw' } }],
      transformation: { script: 'return results.cmd1;', type: 'raw' }
    });
    setViewMode('redis-editor');
  } else if (connector.id === 'websocket') {
    setEditingSource({
      name: '新建 WebSocket 操作',
      type: 'websocket',
      connection: { url: 'ws://127.0.0.1:8080', protocols: '', headers: [] },
      variables: [{ key: '', value: '', description: '', enabled: true }],
      steps: [{ id: 'ws1', name: '发送载荷', action: 'send', format: 'json', payload: '{\n  "event": "ping"\n}', condition: '', transformation: { script: 'return data;', type: 'raw' } }],
      transformation: { script: 'return results.ws1;', type: 'raw' }
    });
    setViewMode('websocket-editor');
  } else if (connector.id === 'modbus') {
    setEditingSource({
      name: '新建 Modbus 连接',
      type: 'modbus',
      connection: { host: '127.0.0.1', port: 502, unitId: 1, timeout: 3000 },
      variables: [{ key: '', value: '', description: '', enabled: true }],
      steps: [{ id: 'mb1', name: '读取保持寄存器', functionCode: 3, address: 0, quantity: 10, condition: '', transformation: { script: 'return data;', type: 'raw' } }],
      transformation: { script: 'return results.mb1;', type: 'raw' }
    });
    setViewMode('modbus-editor');
  } else {
    setEditingSource({ 
      name: '新建' + connector.name, 
      type: connector.id,
      method: 'POST',
      url: '',
      steps: []
    });
    setViewMode('wizard-editor');
  }
}

function onSaveSource(data: any) {
  if (data.id) {
    updateDataSource(data);
  } else {
    addDataSource(data);
  }
  emit('save', data);
  setViewMode('home');
}

function onTest(data: any) {
  emit('test', data);
}

function onSave() {
  if (editorRef.value?.submit) {
    editorRef.value.submit();
  } else if (editingSource.value) {
    onSaveSource(editingSource.value);
  }
}

function onImport() { emit('import'); }
function onExport() { emit('export'); }
</script>

<style lang="scss" scoped>
.data-center-frame {
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--db-color-main);
  overflow: hidden;

  .data-center-sider {
    width: 220px;
    flex: none;
    border-right: 1px solid var(--db-main-border-black);
    background: var(--db-main-color-left-bar-bg);
    display: flex;
    flex-direction: column;
    
    .sider-header {
      padding: 24px 20px 16px;
      .title { font-size: 14px; font-weight: 700; color: var(--theme-color-text-bold); }
    }
    
    .folder-list {
      flex: 1;
      padding: 0 12px;
      .folder-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        .name {
          flex: 1;
          display: inline-flex;
          flex-direction: column;
          &::before {
            content: attr(data-text);
            height: 0;
            visibility: hidden;
            overflow: hidden;
            user-select: none;
            font-weight: 600;
          }
        }

        &:hover { background: var(--theme-color-gray-100); color: var(--theme-color-text-bold); }
        &.active { 
          background: var(--theme-color-gray-200); 
          color: var(--theme-color-blue-700); 
          .name { font-weight: 600; }
        }
        .count { margin-left: auto; font-size: 11px; opacity: 0.5; }
      }
    }
  }

  .data-center-main {
    flex: 1;
    min-width: 0;
    height: 100%;
    position: relative;
    
    .main-scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
    
    .full-screen-editor-container {
      position: absolute;
      inset: 0;
      z-index: 100;
      background: var(--db-color-main);
      display: flex;
      flex-direction: column;
      
      .editor-nav-bar {
        height: 52px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--db-editor-color-panel-bg);
        border-bottom: 1px solid var(--db-main-border-black);
        
        .nav-left {
          display: flex;
          align-items: center;
          gap: 16px;
          .back-link {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-size: 13px;
            color: var(--theme-color-text-secondary);
            &:hover { color: var(--theme-color-blue-700); }
          }
          .divider { width: 1px; height: 16px; background: var(--theme-color-border); }
          .nav-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--theme-color-text-bold);
            .sub { opacity: 0.5; font-weight: 400; margin-left: 4px; }
          }
        }
        
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          height: 100%;
          
          .cancel-btn {
             opacity: 0.8;
             &:hover { opacity: 1; color: var(--theme-color-blue-700); }
          }
        }
        
        .theme-btn {
          height: 30px;
          background: var(--theme-color-blue-700);
          color: #fff;
          font-weight: 600;
          padding: 0 16px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          &:hover { opacity: 0.95; box-shadow: 0 2px 8px rgba(54, 98, 236, 0.3); }
        }
      }
      
      .editor-content-viewport {
        flex: 1;
        overflow: hidden;
      }
    }
  }
}
</style>
