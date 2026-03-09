<template>
  <div class="postman-new-dialog">
    <div class="dialog-header">
      <h2>Create New</h2>
      <CButton quaternary size="small" icon="mdi:close" @click="$emit('back')" />
    </div>
    
    <div class="dialog-grid">
      <div v-for="category in categories" :key="category.title" class="category">
        <h3>{{ category.title }}</h3>
        <div class="items">
          <div v-for="item in category.items" :key="item.id" class="item-card" @click="$emit('select', item)">
            <div class="icon-box" :style="{ color: item.color }">
              <BasicIcon :icon="item.icon" font-size="24px" />
            </div>
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CButton from '@/views/ui/controls/c-button/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';

const categories = [
  {
    title: 'Building Blocks',
    items: [
      { id: 'api', name: 'HTTP Request', desc: 'Create a standard REST API request', icon: 'mdi:api', color: '#0cbb52' },
      { id: 'sql', name: 'SQL Query', desc: 'Execute queries against databases', icon: 'mdi:database', color: '#3b82f6' },
      { id: 'mqtt', name: 'MQTT Message', desc: 'Publish or subscribe to topics', icon: 'mdi:transit-connection-variant', color: '#6366f1' }
    ]
  },
  {
    title: 'Advanced',
    items: [
      { id: 'websocket', name: 'WebSocket', desc: 'Full-duplex communication', icon: 'mdi:lan', color: '#f59e0b' },
      { id: 'grpc', name: 'gRPC Request', desc: 'High-performance RPC', icon: 'mdi:alpha-o-circle-outline', color: '#ef4444' }
    ]
  }
];

defineEmits(['select', 'back']);
</script>

<style lang="scss" scoped>
.postman-new-dialog {
  height: 100%;
  background: var(--db-color-main);
  display: flex;
  flex-direction: column;
  padding: 40px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    h2 { font-size: 24px; font-weight: 400; color: var(--theme-color-text-bold); }
  }

  .dialog-grid {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 40px;

    .category {
      h3 { font-size: 11px; font-weight: 700; color: var(--theme-color-text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
      .items {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
    }

    .item-card {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--db-main-color-card-bg);
      border-radius: var(--border-radius-8);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--theme-color-border);

      &:hover {
        background: var(--theme-color-gray-100);
        border-color: var(--theme-color-blue-700);
        transform: translateY(-2px);
      }

      .icon-box {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--theme-color-gray-50);
        border-radius: var(--border-radius-4);
        margin-right: 16px;
      }

      .info {
        .name { font-size: 14px; font-weight: 600; color: var(--theme-color-text-bold); margin-bottom: 4px; }
        .desc { font-size: 12px; color: var(--theme-color-text-secondary); line-height: 1.4; }
      }
    }
  }
}
</style>
