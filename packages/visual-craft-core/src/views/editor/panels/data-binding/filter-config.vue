<template>
  <CDrawer v-model="show" title="配置过滤器" width="380px" @close="$emit('close')">
    <div class="filter-config-container">
      <!-- 顶层配置区 -->
      <section class="top-controls">
        <div class="control-group">
          <div class="control-label">
            <CIcon icon="mdi:toggle-switch-outline" size="small" />
            <span>过滤器开关</span>
          </div>
          <CSwitch v-model="enabled" />
        </div>

        <div class="control-group">
          <div class="control-label">
            <CIcon icon="mdi:filter-variant" size="small" />
            <span>快速选择</span>
          </div>
          <div class="selector-wrapper">
            <CSelect v-model="selectedFilterId" :options="filterOptions" placeholder="选择或搜索过滤器..." size="small" />
            <CButton primary size="small" square class="add-master-btn" @click="addFilter">
              <CIcon icon="mdi:plus" />
            </CButton>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- 过滤器编辑区 -->
      <section class="filter-workspace">
        <div class="workspace-header">
          <span class="count">{{ filters.length }} 个过滤器已定义</span>
          <CButton type="link" size="small" class="clear-all" v-if="filters.length > 0" @click="filters = []">清空全部</CButton>
        </div>

        <transition-group name="list" tag="div" class="filter-list">
          <div v-for="(filter, index) in filters" :key="filter.id" 
               class="filter-card" :class="{ 'is-expanded': expandedIds.includes(filter.id) }">
            
            <div class="card-header" @click="toggleExpand(filter.id)">
              <div class="header-main">
                <div class="drag-indicator">
                  <span></span><span></span><span></span>
                </div>
                <CLiteSwitch v-model="filter.enabled" @click.stop />
                <span class="filter-title">{{ filter.name }}</span>
              </div>
              <div class="header-meta">
                <span class="usage-badge">{{ filter.usageCount }} components</span>
                <div class="action-group">
                  <CIcon icon="mdi:trash-can-outline" size="small" class="delete-icon" @click.stop="removeFilter(filter.id)" />
                  <CIcon :icon="expandedIds.includes(filter.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'" size="small" class="expand-icon" />
                </div>
              </div>
            </div>

            <transition name="expand">
              <div v-if="expandedIds.includes(filter.id)" class="card-content">
                <!-- 回调字段区 -->
                <div class="content-row callback-section">
                  <div class="row-label">回调字段</div>
                  <div class="tag-cloud">
                    <div v-for="(field, fIdx) in filter.callbackFields" :key="fIdx" class="elegant-tag">
                      <span class="tag-text">{{ field }}</span>
                      <CIcon icon="mdi:close" size="mini" class="tag-close" @click="removeField(filter, fIdx)" />
                    </div>
                    <button class="add-tag-trigger" @click="addField(filter)">
                      <CIcon icon="mdi:plus" size="mini" />
                      <span>添加</span>
                    </button>
                  </div>
                </div>

                <!-- 代码编辑区 -->
                <div class="content-row editor-section">
                  <div class="editor-shell">
                    <div class="shell-header">
                      <span class="func-def">function <span class="func-name">filter</span>(data, callbackArgs) {</span>
                    </div>
                    <div class="editor-wrapper">
                      <CCodeEditor 
                        v-model="filter.code" 
                        language="javascript" 
                        height="200px" 
                      />
                    </div>
                    <div class="shell-footer">}</div>
                  </div>
                </div>

                <!-- 卡片操作区 -->
                <div class="card-footer">
                  <CButton size="small" class="test-trigger">
                    <CIcon icon="mdi:play-circle-outline" size="small" />
                    <span>运行测试</span>
                  </CButton>
                  <div class="footer-right">
                    <CButton size="small" class="ghost-btn">取消</CButton>
                    <CButton primary size="small" class="save-btn">保存更改</CButton>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </transition-group>

        <div v-if="filters.length === 0" class="empty-workspace">
          <CIcon icon="mdi:filter-plus-outline" size="large" />
          <p>暂无过滤器，点击上方 "+" 号开始创建</p>
        </div>
      </section>

      <!-- 结果预览区 -->
      <section class="results-panel">
        <div class="results-header">
          <div class="header-left">
            <span class="dot"></span>
            <span class="title">执行结果预览</span>
          </div>
          <CIcon icon="mdi:refresh" size="small" class="refresh-btn" @click="refreshData" />
        </div>
        <div class="results-viewer">
          <CCodeEditor 
            :model-value="previewData" 
            read-only 
            language="json" 
            height="260px" 
          />
        </div>
      </section>
    </div>
  </CDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CDrawer from '@/views/ui/controls/c-drawer/index.vue';
import CSwitch from '@/views/ui/controls/c-switch/index.vue';
import CSelect from '@/views/ui/controls/c-select/index.vue';
import CButton from '@/views/ui/controls/c-button/index.vue';
import CIcon from '@/views/ui/controls/c-icon/index.vue';
import CLiteSwitch from '@/views/ui/controls/c-lite-switch/index.vue';
import CCodeEditor from '@/views/ui/controls/c-code-editor/index.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'close']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const enabled = ref(true);
const selectedFilterId = ref('');
const filters = ref<any[]>([]);
const expandedIds = ref<string[]>([]);

const filterOptions = computed(() => {
  return filters.value.map(f => ({
    label: f.name || '未命名过滤器',
    value: f.id
  }));
});

function addFilter() {
  const newId = Date.now().toString();
  filters.value.push({
    id: newId,
    name: '新建过滤器 ' + (filters.value.length + 1),
    enabled: true,
    usageCount: 0,
    code: '  // 在这里编写过滤逻辑\n  return data;',
    callbackFields: ['e', '3']
  });
  expandedIds.value = [newId]; // Auto expand new one
}

function removeFilter(id: string) {
  filters.value = filters.value.filter(f => f.id !== id);
}

function toggleExpand(id: string) {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(i => i !== id);
  } else {
    expandedIds.value = [id]; // Accordion style
  }
}

function addField(filter: any) {
  filter.callbackFields.push('param' + (filter.callbackFields.length + 1));
}

function removeField(filter: any, index: number) {
  filter.callbackFields.splice(index, 1);
}

function refreshData() {
  console.log('Refreshing execution result...');
}

const previewData = ref(JSON.stringify([
  { "x": "1月", "y": 48, "s": "系列一", "colorField": 100 },
  { "x": "2月", "y": 40, "s": "系列一" },
  { "x": "3月", "y": 24, "s": "系列一" },
  { "x": "4月", "y": 48, "s": "系列一" },
  { "x": "5月", "y": 49, "s": "系列一", "colorField": 200 }
], null, 2));
</script>

<style lang="scss" scoped>
.filter-config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--db-editor-panel-bg, #1e1e1e);
  color: var(--theme-color-text, #fff);
  font-family: inherit;

  .divider {
    height: 1px;
    background: var(--theme-color-real-gray-700, rgba(255, 255, 255, 0.05));
    margin: 4px 0;
  }

  /* 顶部控制区 */
  .top-controls {
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .control-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .control-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: var(--theme-color-tran-70);
        
        .c-icon { opacity: 0.7; }
      }

      .selector-wrapper {
        flex: 1;
        display: flex;
        gap: 6px;
        max-width: 240px;

        .add-master-btn {
          transition: transform 0.2s;
          &:hover { transform: scale(1.05); }
        }
      }
    }
  }

  /* 过滤器工作区 */
  .filter-workspace {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .workspace-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px;
      
      .count {
        font-size: 10px;
        font-weight: 600;
        color: var(--theme-color-tran-45);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .clear-all {
        font-size: 10px;
        color: var(--theme-color-error, #ff4d4f);
        opacity: 0.6;
        &:hover { opacity: 1; }
      }
    }

    .filter-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-card {
      background: var(--db-color-card-background, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--theme-color-real-gray-700, rgba(255, 255, 255, 0.05));
      border-radius: 6px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        background: var(--db-color-card-bg-hover, rgba(255, 255, 255, 0.05));
        border-color: var(--theme-color-real-gray-600, rgba(255, 255, 255, 0.1));
      }

      &.is-expanded {
        background: var(--db-color-card-bg-active, rgba(54, 98, 236, 0.03));
        border-color: var(--theme-color-primary, #3662ec);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }

      .card-header {
        padding: 6px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        .header-main {
          display: flex;
          align-items: center;
          gap: 10px;

          .drag-indicator {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 2px;
            opacity: 0.2;
            span { width: 2px; height: 2px; background: currentColor; border-radius: 50%; }
          }

          .filter-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--theme-color-text);
          }
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .usage-badge {
            font-size: 9px;
            color: var(--theme-color-primary);
            background: var(--theme-color-primary-tran-10, rgba(54, 98, 236, 0.1));
            padding: 1px 6px;
            border-radius: 10px;
            font-weight: 600;
          }

          .action-group {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .delete-icon {
              opacity: 0.3;
              transition: all 0.2s;
              &:hover { opacity: 1; color: var(--theme-color-error); }
            }
            .expand-icon { opacity: 0.5; }
          }
        }
      }

      .card-content {
        padding: 0 12px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .content-row {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .row-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--theme-color-tran-45);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        /* 回调标签 */
        .tag-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;

          .elegant-tag {
            background: var(--db-color-tag-background, rgba(255, 255, 255, 0.05));
            border: 1px solid var(--theme-color-real-gray-700, rgba(255, 255, 255, 0.08));
            border-radius: 3px;
            padding: 2px 6px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            
            .tag-close {
              font-size: 9px;
              opacity: 0.4;
              &:hover { opacity: 1; color: var(--theme-color-error); }
            }
          }

          .add-tag-trigger {
            background: transparent;
            border: 1px dashed var(--theme-color-primary-tran-40, rgba(54, 98, 236, 0.4));
            border-radius: 3px;
            padding: 2px 8px;
            color: var(--theme-color-primary);
            font-size: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: var(--theme-color-primary-tran-10);
              border-color: var(--theme-color-primary);
            }
          }
        }

        /* 编辑器外壳 */
        .editor-shell {
          background: var(--db-color-code-background, #0a0a0a);
          border-radius: 4px;
          border: 1px solid var(--theme-color-real-gray-700);
          overflow: hidden;

          .shell-header, .shell-footer {
            padding: 6px 12px;
            background: var(--theme-color-tran-5, rgba(255, 255, 255, 0.02));
            font-family: 'Fira Code', monospace;
            font-size: 11px;
            color: var(--theme-color-tran-45);

            .func-def {
              .func-name { color: var(--theme-color-func-name, #dcdcaa); }
            }
          }

          .editor-wrapper {
            :deep(.c-code-editor-content) {
              border: none;
              background: transparent;
            }
          }
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0;
          flex-wrap: nowrap;
          width: 100%;
          overflow: hidden;

          .test-trigger {
            background: transparent;
            border: 1px solid var(--theme-color-primary-tran-40);
            color: var(--theme-color-primary);
            font-weight: 600;
            padding: 0 10px;
            height: 24px;
            flex-shrink: 0;
            
            :deep(.c-button-text) {
              white-space: nowrap;
            }
            
            &:hover {
              background: var(--theme-color-primary-tran-10);
              border-color: var(--theme-color-primary);
            }
          }

          .footer-right {
            display: flex;
            gap: 6px;
            flex-shrink: 0;
            flex-wrap: nowrap;
            margin-left: 8px;

            .ghost-btn, .save-btn {
              height: 24px;
              flex-shrink: 0;
              :deep(.c-button-text) {
                white-space: nowrap;
              }
            }
            
            .ghost-btn {
              opacity: 0.6;
              padding: 0 8px;
              &:hover { opacity: 1; background: var(--theme-color-tran-5); }
            }
            .save-btn {
              padding: 0 10px;
            }
          }
        }
      }
    }
  }

  /* 结果预览区 */
  .results-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .results-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .dot {
          width: 5px;
          height: 5px;
          background: var(--theme-color-success, #4caf50);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--theme-color-success);
        }

        .title {
          font-size: 10px;
          font-weight: 700;
          color: var(--theme-color-tran-45);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .refresh-btn {
        opacity: 0.4;
        transition: all 0.3s;
        &:hover { opacity: 1; color: var(--theme-color-primary); transform: rotate(180deg); }
      }
    }

    .results-viewer {
      border: 1px solid var(--theme-color-real-gray-700);
      border-radius: 6px;
      overflow: hidden;
      background: var(--db-color-code-background);
    }
  }

  .empty-workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    opacity: 0.2;
    p { font-size: 13px; font-weight: 500; }
  }

  /* 动画 */
  .expand-enter-active, .expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }
  .expand-enter-from, .expand-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  .expand-enter-to, .expand-leave-from {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }

  .list-enter-active, .list-leave-active {
    transition: all 0.4s ease;
  }
  .list-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  .list-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
