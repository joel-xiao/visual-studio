<template>
  <div class="data-center-home">
    <!-- Top toolbar for global actions -->
    <div class="home-toolbar">
       <div class="title-group">
          <h1>数据接口管理</h1>
          <span class="count">{{ dataSourceList.length }}</span>
       </div>
       <div class="actions">
          <CButton quaternary size="small" icon="mdi:import" @click="$emit('import')">批量导入</CButton>
          <CButton quaternary size="small" icon="mdi:export" @click="$emit('export')">导出全部</CButton>
       </div>
    </div>

    <!-- My Data Instances Section: Clear list of created sources -->
    <div v-if="dataSourceList.length > 0" class="section-container">
      <div class="section-header">
         <div class="title-group">
            <span class="title">已接入的数据源</span>
            <span class="sub">管理和维护您的数据连接</span>
         </div>
      </div>
      <div class="instance-grid">
         <div 
           v-for="item in dataSourceList" 
           :key="item.id" 
           class="instance-card"
           @click="$emit('edit', item)"
          >
            <div class="card-header">
               <div class="header-left">
                  <BasicIcon :icon="item.type === 'api' ? 'mdi:api' : 'mdi:database'" font-size="20px" />
                  <span class="method-tag">{{ item.method || 'POST' }}</span>
               </div>
               <div class="header-actions">
                  <BasicIcon 
                    icon="mdi:delete-outline" 
                    class="del-icon" 
                    font-size="16px" 
                    @click.stop="$emit('delete', item.id)" 
                  />
               </div>
            </div>
            <div class="card-body">
               <div class="name ellipsis">{{ item.name }}</div>
               <div class="url ellipsis">{{ item.url }}</div>
            </div>
         </div>
      </div>
    </div>

    <!-- Connector Center: The official way to create NEW ones -->
    <div class="section-container plugins-section">
      <div class="section-header">
         <div class="title-group">
            <span class="title">连接器中心</span>
            <span class="sub">选择一个协议快速创建您的数据接口</span>
         </div>
         <div class="search-bar">
            <CInput 
              v-model="searchQuery" 
              placeholder="搜索连接器..." 
              icon="mdi:magnify" 
              size="small"
              class="plugin-search"
            />
         </div>
      </div>
      <div class="plugins-grid">
         <div v-for="plugin in filteredPlugins" :key="plugin.id" class="plugin-card" @click="onNewFromPlugin(plugin)">
            <div class="icon-box" :style="{ background: plugin.bgColor, color: plugin.color }">
              <BasicIcon :icon="plugin.icon" font-size="28px" />
            </div>
            <div class="info">
               <div class="name">{{ plugin.name }}</div>
               <div class="desc">{{ plugin.description || '标准数据接入协议' }}</div>
               <div class="footer">
                  <span class="tag">官方</span>
                  <span class="status">已启用</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CInput from '@/views/ui/controls/c-input/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { useDataCenterContext } from '../hooks/data-center-context';

const emit = defineEmits(['new', 'edit', 'delete', 'select-plugin', 'import', 'export']);
const searchQuery = ref('');

const { dataSourceList } = useDataCenterContext();

function onNewFromPlugin(plugin: any) {
  emit('select-plugin', plugin);
}

const bannerLinks = [
  { name: '快速入门', url: '#', icon: 'mdi:rocket-launch-outline' },
  { name: '接口规范', url: '#', icon: 'mdi:book-open-outline' },
  { name: '接入视频', url: '#', icon: 'mdi:video-outline' }
];

const plugins = [
  { id: 'api', name: 'HTTP/HTTPS', description: 'RESTful API, Webhook 接入', icon: 'mdi:api', color: '#38BDF8', bgColor: 'rgba(56, 189, 248, 0.1)' },
  { id: 'sql', name: 'MySQL/Oracle/Postgre', description: '关系型数据库查询', icon: 'mdi:database', color: '#34D399', bgColor: 'rgba(52, 211, 153, 0.1)' },
  { id: 'mqtt', name: 'MQTT', description: '物联网物联网协议接入', icon: 'mdi:transit-connection-variant', color: '#818CF8', bgColor: 'rgba(129, 140, 248, 0.1)' },
  { id: 'websocket', name: 'WebSocket', description: '全双工实时通信', icon: 'mdi:lan', color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.1)' },
  { id: 'redis', name: 'Redis', description: '高并发缓存读写', icon: 'mdi:flash-outline', color: '#F87171', bgColor: 'rgba(248, 113, 113, 0.1)' },
  { id: 'modbus', name: 'Modbus TCP', description: '工业自动化协议', icon: 'mdi:engine-outline', color: '#A78BFA', bgColor: 'rgba(167, 139, 250, 0.1)' }
];

const filteredPlugins = computed(() => {
  if (!searchQuery.value) return plugins;
  const q = searchQuery.value.toLowerCase();
  return plugins.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
});
</script>

<style lang="scss" scoped>
.data-center-home {
  padding: 24px 40px;
  background: var(--db-color-main);
  color: var(--theme-color-text);
  min-height: 100%;

  .home-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--db-main-border-black);
    
    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
      h1 { font-size: 20px; font-weight: 700; color: var(--theme-color-text-bold); margin: 0; }
      .count { font-size: 12px; padding: 2px 10px; background: var(--theme-color-gray-100); border-radius: 10px; color: var(--theme-color-text-secondary); font-weight: 600; }
    }
    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .section-container {
    margin-bottom: 40px;
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      .title-group {
         display: flex;
         align-items: baseline;
         gap: 12px;
         .title { font-size: 18px; font-weight: 700; color: var(--theme-color-text-bold); }
         .sub { font-size: 13px; color: var(--theme-color-text-secondary); }
      }
    }

    .instance-grid {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      
      .instance-card, .create-card {
        width: 260px;
        height: 120px;
        background: var(--db-main-color-card-bg);
        border: 1px solid var(--theme-color-border);
        border-radius: 10px;
        padding: 16px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
        
        &:hover {
          border-color: var(--theme-color-blue-700);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      }

      .instance-card {
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            color: var(--theme-color-text-secondary);
            
            .header-left {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .del-icon {
               opacity: 0;
               transition: all 0.2s;
               &:hover { color: #f87171; transform: scale(1.1); }
            }
            
            .method-tag {
               font-size: 10px;
               font-weight: 700;
               background: rgba(54, 98, 236, 0.1);
               color: var(--theme-color-blue-700);
               padding: 2px 6px;
               border-radius: 4px;
            }
          }
          
          &:hover .del-icon { opacity: 0.6; }
         .card-body {
            .name { font-size: 13px; font-weight: 700; color: var(--theme-color-text-bold); margin-bottom: 4px; }
            .url { font-size: 11px; color: var(--theme-color-text-secondary); opacity: 0.7; }
         }
      }

      .create-card {
        align-items: center;
        justify-content: center;
        color: var(--theme-color-text-secondary);
        border-style: dashed;
        gap: 12px;
        
        &:hover { border-style: solid; background: var(--theme-color-gray-50); }
        &.active {
           border-color: var(--db-main-color-post);
           .icon-wrap { color: var(--db-main-color-post); }
           .text { color: var(--theme-color-text-bold); }
        }
        .icon-wrap { color: var(--theme-color-gray-600); }
        .text { font-size: 13px; font-weight: 600; }
      }
    }
  }

  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    .plugin-card {
      background: var(--db-main-color-card-bg);
      border: 1px solid var(--theme-color-border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--theme-color-blue-700); background: var(--theme-color-gray-50); }
      
      .icon-box {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        flex: none;
      }
      
      .info {
        flex: 1;
        .name { font-size: 15px; font-weight: 700; color: var(--theme-color-text-bold); margin-bottom: 6px; }
        .desc { 
          font-size: 12px; 
          color: var(--theme-color-text-secondary); 
          margin-bottom: 16px; 
          line-height: 1.5; 
          height: 36px; 
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          line-clamp: 2;
          -webkit-box-orient: vertical; 
          overflow: hidden; 
        }
        .footer {
          display: flex;
          align-items: center;
          gap: 12px;
          .tag { font-size: 10px; background: rgba(var(--db-main-color-post-rgb), 0.1); color: var(--db-main-color-post); padding: 2px 6px; border-radius: 4px; font-weight: 700; }
          .status { font-size: 11px; color: #52c41a; display: flex; align-items: center; gap: 4px; &::before { content: ''; width: 6px; height: 6px; background: #52c41a; border-radius: 50%; } }
        }
      }
    }
  }
}
</style>
