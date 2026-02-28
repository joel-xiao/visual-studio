<template>
  <div class="c-color-scheme">
    <BasicBox ref="boxRef" v-bind="$attrs" :model-value="isPopoverVisible" type="input" class="scheme-trigger-box">
      <BasicPopover
        ref="popoverRef"
        v-model:show="isPopoverVisible"
        trigger="click"
        placement="bottom-start"
        :show-arrow="false"
        class="c-color-scheme-popover"
      >
        <template #trigger>
          <div class="trigger-content">
            <template v-if="currentColorList.length">
              <div class="preview-strip">
                <div
                  v-for="(color, index) in currentColorList"
                  :key="index"
                  class="strip-item"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <!-- <span class="scheme-name">{{ currentSchemeName }}</span> -->
            </template>
            <span v-else class="scheme-placeholder">选择配色</span>
            <!-- <i class="icon-font icon-shouqi2 trigger-arrow"></i> -->
          </div>
        </template>

        <div class="scheme-panel">
          <div class="panel-header">
            <span class="title">配色方案</span>
          </div>

          <div class="panel-body custom-scroll">
            <!-- Custom Schemes -->
            <div class="scheme-group">
              <div class="group-title">自定义</div>
              <div class="scheme-list">
                 <!-- Add New Card -->
                <div class="scheme-item add-item" @click="openManager">
                  <div class="add-icon-wrapper">
                    <BasicIcon icon="mdi:plus" />
                  </div>
                  <span class="add-label">新建方案</span>
                </div>

                <div
                  v-for="scheme in customSchemes"
                  :key="scheme.id"
                  class="scheme-item"
                  :class="{ active: props.modelValue === scheme.id }"
                  @click="onSelectScheme(scheme.id)"
                >
                  <div class="scheme-preview">
                    <div
                      v-for="(color, idx) in scheme.color.slice(0, 8)"
                      :key="idx"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    ></div>
                  </div>
                  <div class="scheme-info">
                    <span class="name">{{ scheme.name }}</span>
                    <div class="actions">
                      <BasicIcon icon="mdi:pencil" class="action-icon" @click.stop="editScheme(scheme)" />
                      <BasicIcon icon="mdi:delete" class="action-icon" @click.stop="deleteScheme(scheme.id)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Schemes -->
            <div class="scheme-group">
              <div class="group-title">系统预设</div>
              <div class="scheme-list">
                <div
                  v-for="(colors, name) in systemSchemes"
                  :key="name"
                  class="scheme-item"
                  :class="{ active: props.modelValue === String(name) }"
                  @click="onSelectScheme(String(name))"
                >
                  <div class="scheme-preview">
                    <div
                      v-for="(color, idx) in colors.slice(0, 8)"
                      :key="idx"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                    ></div>
                  </div>
                  <div class="scheme-info">
                    <span class="name">{{ name }}</span>
                    <BasicIcon v-if="props.modelValue === String(name)" icon="mdi:check" class="check-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BasicPopover>
    </BasicBox>

    <ManagerModal
      v-model="managerVisible"
      :edit-data="currentEditScheme"
      @save="onSaveScheme"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'C_COLOR_SCHEME',
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BasicBox from '../../base/basic-box.vue';
import BasicPopover from '../../base/basic-popover.vue';
import BasicIcon from '../../base/basic-icon.vue';
import ManagerModal from './manager-modal.vue';
import { chartColors, type ChartColorsNameType, type CustomColorsType } from '@/views/editor/hooks/chart-themes-context/data';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:modelValue', 'update', 'change']);

// State
const isPopoverVisible = ref(false);
const managerVisible = ref(false);
const currentEditScheme = ref<any>(null);
const popoverRef = ref<InstanceType<typeof BasicPopover> | null>(null);

// System Schemes: derive color palettes from the actual ECharts theme data
const systemSchemes = computed(() => {
  const schemes: Record<string, string[]> = {};
  for (const [name, themeData] of Object.entries(chartColors)) {
    // Handle both direct object and { default: object } (depending on bundler/loader)
    const data = (themeData as any).default || themeData;
    schemes[name] = data.color || [];
  }
  return schemes;
});

// Custom Schemes Data
const customSchemes = ref<CustomColorsType[]>([]);

// Computed
const currentColorList = computed(() => {
  if (!props.modelValue || props.modelValue === 'false') return [];

  // Check system
  if (systemSchemes.value[props.modelValue]) {
    return systemSchemes.value[props.modelValue];
  }

  // Check custom
  const custom = customSchemes.value.find(s => s.id === props.modelValue);
  return custom ? custom.color : [];
});

const currentSchemeName = computed(() => {
   if (!props.modelValue || props.modelValue === 'false') return '';
   const custom = customSchemes.value.find(s => s.id === props.modelValue);
   if (custom) return custom.name;
   if (systemSchemes.value[props.modelValue]) return props.modelValue;
   return '';
});

// Methods
const onSelectScheme = (id: string) => {
  emits('update:modelValue', id);
  emits('update', id);
  emits('change', id);
  isPopoverVisible.value = false;
};

onMounted(() => {
  if (!props.modelValue || props.modelValue === 'false') {
    if (systemSchemes.value['dark']) {
      onSelectScheme('dark');
    }
  }
});

const openManager = () => {
  currentEditScheme.value = null;
  managerVisible.value = true;
};

const editScheme = (scheme: CustomColorsType) => {
  currentEditScheme.value = JSON.parse(JSON.stringify(scheme));
  managerVisible.value = true;
};

const deleteScheme = (id: string) => {
  const index = customSchemes.value.findIndex(s => s.id === id);
  if (index > -1) {
    customSchemes.value.splice(index, 1);
    if (props.modelValue === id) {
      onSelectScheme(''); // Reset if deleted
    }
  }
};

const onSaveScheme = (scheme: any) => {
  if (scheme.id) {
    // Update existing
    const index = customSchemes.value.findIndex(s => s.id === scheme.id);
    if (index > -1) {
      customSchemes.value[index] = scheme;
    } else {
       customSchemes.value.push(scheme);
    }
  } else {
    // Create new
    const newScheme = {
      ...scheme,
      id: `custom_${Date.now()}`,
    };
    customSchemes.value.push(newScheme);
    // Auto select new scheme
    onSelectScheme(newScheme.id);
  }
  managerVisible.value = false;
};
</script>

<style scoped>
.c-color-scheme {
  width: 100%;
}

.scheme-trigger-box {
  cursor: pointer;
  transition: all 0.2s;
}

.trigger-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 6px 0 6px;
  gap: 4px;
}

.preview-strip {
  display: flex;
  flex: 1;
  height: 16px;
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
  gap: 1px;
}

.strip-item {
  flex: 1;
  height: 100%;
  min-width: 0;
}

.scheme-name {
  font-size: 11px;
  color: var(--theme-color-text-primary);
  opacity: 0.8;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scheme-placeholder {
  flex: 1;
  font-size: 11px;
  color: var(--theme-color-text-secondary);
  opacity: 0.6;
  padding-left: 2px;
}

.trigger-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none;
  color: var(--db-color-select-arrow);
  transform: scale(0.9) rotate(90deg);
  font-weight: normal;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  transition: background 0.15s;
}

.trigger-arrow:hover {
  background: var(--db-color-select-arrow-bg-hover);
}

/* Panel Styles */
.scheme-panel {
  width: 260px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header .title {
  font-weight: 600;
  font-size: 12px;
  color: var(--theme-color-text-primary);
  opacity: 0.7;
}

.panel-body {
  max-height: 320px;
  overflow-y: auto;
  padding: 2px 0 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.scheme-group {
  margin-bottom: 4px;
}

.scheme-group:last-child {
  margin-bottom: 0;
}

.group-title {
  padding: 6px 10px 2px;
  font-size: 10px;
  color: var(--theme-color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.scheme-item {
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-left: 2px solid transparent;
  color: var(--theme-color-text-primary);
}

.scheme-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.scheme-item.active {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: var(--db-color-button-primary-bg);
}

/* Add Item Style */
.scheme-item.add-item {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  color: var(--theme-color-text-secondary);
  border-left: 2px solid transparent;
}

.scheme-item.add-item:hover {
  color: var(--theme-color-text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.add-icon-wrapper {
  width: 18px;
  height: 18px;
  border: 1px dashed var(--theme-color-text-secondary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transform: translateY(1px);
}

.scheme-item.add-item:hover .add-icon-wrapper {
  border-color: var(--theme-color-text-primary);
}

.add-label {
  font-size: 11px;
}

.scheme-preview {
  display: flex;
  gap: 1px;
  height: 14px;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
}

.color-dot {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.scheme-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.scheme-info .name {
  color: var(--theme-color-text-primary);
  opacity: 0.8;
}

.scheme-item.active .name {
  color: var(--db-color-button-primary-bg);
  font-weight: 500;
  opacity: 1;
}

.arrow-icon {
  font-size: 16px;
}

.check-icon {
  color: var(--db-color-button-primary-bg);
  font-size: 14px;
}

.actions {
  display: none;
  gap: 4px;
}

.scheme-item:hover .actions {
  display: flex;
}

.action-icon {
  color: var(--theme-color-text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.action-icon:hover {
  color: var(--db-color-button-primary-bg);
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
</style>
