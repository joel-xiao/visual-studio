<template>
  <CModal 
    :model-value="modelValue" 
    width="1000px"
    class="pro-ref-modal-wrap"
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <template #header>
       <div class="title-with-count">
          <span>引用接口资源</span>
          <span class="count">{{ filteredRefs.length }} 个结果</span>
       </div>
    </template>

    <div class="modal-body">
       <!-- Left Sidebar: Categories -->
       <div class="modal-sider">
          <div 
            v-for="cat in refCategories" 
            :key="cat.id" 
            class="cat-item"
            :class="{ active: activeRefCategory === cat.id }"
            @click="activeRefCategory = cat.id"
          >
             <BasicIcon :icon="cat.icon" font-size="16px" />
             <span>{{ cat.label }}</span>
          </div>
       </div>

       <!-- Right Content: Search + List -->
       <div class="modal-content">
          <div class="search-bar">
             <div class="search-input-wrap">
                <BasicIcon icon="mdi:magnify" font-size="18px" class="m-icon" />
                <input v-model="refSearch" placeholder="输入名称或关键字快速定位..." />
                <div v-if="refSearch" class="clear-btn" @click="refSearch = ''">
                   <BasicIcon icon="mdi:close-circle" font-size="14px" />
                </div>
             </div>
          </div>

          <div class="interface-grid">
             <div class="grid-header">
                <div class="col-name">资源名称</div>
                <div class="col-method">方法</div>
                <div class="col-url">端点 URL</div>
                <div class="col-action"></div>
             </div>
             <div class="grid-body">
                <div
                  v-for="item in filteredRefs"
                  :key="item.id"
                  class="grid-row"
                  @click="$emit('select', item)"
                >
                   <div class="col-name">
                      <div class="name-box">
                         <BasicIcon :icon="item.type === 'api' ? 'mdi:api' : 'mdi:database'" class="type-icon" />
                         <span class="name-text">{{ item.name }}</span>
                      </div>
                   </div>
                   <div class="col-method">
                      <span v-if="item.type === 'api'" class="m-badge" :class="item.method?.toLowerCase()">{{ item.method }}</span>
                      <span v-else class="m-badge sql">SQL</span>
                   </div>
                   <div class="col-url">
                      <span class="url-text">{{ item.url || '-' }}</span>
                   </div>
                   <div class="col-action">
                      <div class="use-btn">引用</div>
                   </div>
                </div>
                <div v-if="filteredRefs.length === 0" class="empty-state">
                   <BasicIcon icon="mdi:database-search-outline" font-size="48px" />
                   <p>未找到匹配的接口资源</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CModal from '@/views/ui/controls/c-modal/index.vue';
import BasicIcon from '@/views/ui/base/basic-icon.vue';
import { useDataCenterContext } from '../../../hooks/data-center-context';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const { dataSourceList } = useDataCenterContext();
const refSearch = ref('');
const activeRefCategory = ref('all');

const refCategories = [
  { label: '全部接口', id: 'all', icon: 'mdi:view-grid' },
  { label: 'HTTP 接口', id: 'api', icon: 'mdi:api' },
  { label: 'SQL 查询', id: 'sql', icon: 'mdi:database' },
  { label: '最近使用', id: 'recent', icon: 'mdi:clock-outline' }
];

const filteredRefs = computed(() => {
  let list = dataSourceList.value || [];
  if (activeRefCategory.value !== 'all' && activeRefCategory.value !== 'recent') {
    list = list.filter(item => item.type === activeRefCategory.value);
  }
  if (!refSearch.value) return list;
  const s = refSearch.value.toLowerCase();
  return list.filter(item => 
    item.name.toLowerCase().includes(s) || 
    (item.url && item.url.toLowerCase().includes(s))
  );
});
</script>

<style lang="scss">
#visual-craft-core, #visual-craft-core-project {
  .basic-modal-mask.pro-ref-modal-wrap {
    background-color: rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(8px);

    .basic-modal-wrapper {
      width: 1000px !important;
      height: 700px !important;
      max-width: 95%;
      border: 1px solid var(--db-main-border-black) !important;
      background-color: var(--db-editor-color-panel-bg) !important;
      border-radius: 12px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
    }

    .basic-modal-header {
      padding: 16px 24px !important;
      height: 56px !important;
      border-bottom: 1px solid var(--db-main-border-black) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      
      .title-with-count {
         display: flex;
         align-items: baseline;
         gap: 12px;
         span { font-size: 18px; font-weight: 700; color: var(--theme-color-text-bold); }
         .count { font-size: 12px; font-weight: 400; color: var(--theme-color-text-secondary); opacity: 0.6; }
      }

      .basic-modal-close {
         cursor: pointer;
         width: 32px;
         height: 32px;
         display: flex;
         align-items: center;
         justify-content: center;
         border-radius: 6px;
         color: var(--theme-color-text-secondary);
         transition: all 0.2s;
         opacity: 0.6;
         padding-right: 0px;
         margin-right: -4px;

         &:hover {
           background: var(--theme-color-gray-100);
           color: var(--theme-color-red-500);
           opacity: 1;
           transform: rotate(90deg);
         }
      }
    }

    .basic-modal-body {
       padding: 0 !important;
       flex: 1 !important;
       display: flex !important;
       overflow: hidden !important;

       .modal-body {
          flex: 1 !important;
          display: flex !important;
          overflow: hidden !important;
          width: 100%;

          .modal-sider {
             width: 220px !important;
             background: var(--theme-color-gray-50);
             border-right: 1px solid var(--db-main-border-black);
             padding: 12px 8px;
             display: flex;
             flex-direction: column;
             gap: 4px;

             .cat-item {
                padding: 12px 16px !important;
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 12px !important;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                color: var(--theme-color-text-secondary);
                transition: all 0.2s;

                &:hover { background: var(--theme-color-gray-100); color: var(--theme-color-text-bold); }
                &.active { 
                  background: var(--theme-color-blue-700) !important; 
                  color: #fff !important; 
                  font-weight: 600;
                  box-shadow: 0 4px 12px rgba(54, 98, 236, 0.2);
                }
             }
          }

          .modal-content {
             flex: 1;
             display: flex;
             flex-direction: column;
             overflow: hidden;
             background: var(--db-color-main);

             .search-bar {
                padding: 16px 24px;
                border-bottom: 1px solid var(--theme-color-border);
                
                .search-input-wrap {
                   position: relative;
                   display: flex;
                   align-items: center;
                   background: var(--theme-color-gray-50);
                   border: 1px solid var(--theme-color-border);
                   border-radius: 8px;
                   padding: 0 12px;
                   transition: all 0.2s;

                   &:focus-within { border-color: var(--theme-color-blue-700); background: #fff; box-shadow: 0 0 0 2px rgba(54, 98, 236, 0.1); }

                   .m-icon { color: var(--theme-color-text-secondary); opacity: 0.5; }
                   input {
                     flex: 1;
                     padding: 10px 8px;
                     border: none;
                     background: transparent;
                     font-size: 14px;
                     color: var(--theme-color-text-bold);
                     &:focus { outline: none; }
                   }
                   .clear-btn { cursor: pointer; color: var(--theme-color-text-secondary); opacity: 0.5; &:hover { opacity: 1; } }
                }
             }

             .interface-grid {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;

                .grid-header {
                   display: grid;
                   grid-template-columns: 240px 100px 1fr 80px;
                   padding: 10px 24px;
                   background: var(--theme-color-gray-50);
                   border-bottom: 1px solid var(--theme-color-border);
                   font-size: 11px;
                   font-weight: 700;
                   color: var(--theme-color-text-secondary);
                   text-transform: uppercase;
                   letter-spacing: 0.5px;
                }

                .grid-body {
                   flex: 1;
                   overflow-y: auto;
                   padding: 4px 0;

                   .grid-row {
                      display: grid;
                      grid-template-columns: 240px 100px 1fr 80px;
                      align-items: center;
                      padding: 10px 24px;
                      border-bottom: 1px solid var(--theme-color-gray-100);
                      cursor: pointer;
                      transition: all 0.2s;

                      &:hover {
                         background: rgba(54, 98, 236, 0.03);
                         .col-name .name-text { color: var(--theme-color-blue-700); }
                         .use-btn { background: var(--theme-color-blue-700); color: #fff; opacity: 1; }
                      }

                      .col-name {
                         .name-box {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            .type-icon { color: var(--theme-color-blue-700); font-size: 16px; opacity: 0.7; }
                            .name-text { font-size: 13px; font-weight: 600; color: var(--theme-color-text-bold); transition: color 0.2s; }
                         }
                      }

                      .col-method {
                         .m-badge {
                            font-size: 10px;
                            font-weight: 800;
                            padding: 2px 6px;
                            border-radius: 4px;
                            text-align: center;
                            display: inline-block;
                            min-width: 50px;
                            
                            &.get { color: var(--db-main-color-get); background: rgba(14, 165, 233, 0.1); }
                            &.post { color: var(--db-main-color-post); background: rgba(52, 211, 153, 0.1); }
                            &.sql { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                         }
                      }

                      .col-url {
                         .url-text { font-size: 12px; color: var(--theme-color-text-secondary); opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                      }

                      .col-action {
                         .use-btn {
                            font-size: 12px;
                            font-weight: 600;
                            padding: 4px 12px;
                            border-radius: 4px;
                            background: var(--theme-color-gray-100);
                            color: var(--theme-color-text-secondary);
                            text-align: center;
                            opacity: 0.8;
                            transition: all 0.2s;
                         }
                      }
                   }

                   .empty-state {
                      padding: 100px 0;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      color: var(--theme-color-text-secondary);
                      opacity: 0.4;
                      p { margin-top: 16px; font-size: 14px; }
                   }
                }
             }
          }
       }
    }
  }
}
</style>

