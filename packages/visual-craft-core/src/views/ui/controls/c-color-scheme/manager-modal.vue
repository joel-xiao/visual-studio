<template>
  <BasicModal
    v-bind="$attrs"
    :model-value="modelValue"
    title="配置配色方案"
    class="c-color-scheme-manager"
    width="480px"
    @update:model-value="updateVisible"
  >
    <div class="manager-content">
      <!-- Name -->
      <div class="form-group">
        <label class="form-label">方案名称</label>
        <BasicInput v-model="form.name" placeholder="给你的配色方案起个名字" :input="true" />
      </div>

      <!-- Colors -->
      <div class="form-group">
        <div class="group-header">
          <label class="form-label">色板配置</label>
          <span class="count-badge">{{ form.color.length }} 色</span>
        </div>

        <div class="color-grid">
          <div v-for="(color, index) in form.color" :key="index" class="color-item">
            <BasicColorPicker v-model="form.color[index]" class="color-picker-trigger" />
            <div class="remove-btn" @click="removeColor(index)" title="删除颜色">
              <BasicIcon icon="mdi:close" style="font-size: 10px;" />
            </div>
          </div>
          <div class="add-color-btn" @click="addColor" title="添加颜色">
            <BasicIcon icon="mdi:plus" />
          </div>
        </div>
      </div>

      <!-- Theme Overrides -->
      <div class="form-group">
        <label class="form-label">样式覆盖 (可选)</label>
        <div class="theme-options">
          <div class="theme-row">
            <div class="row-left">
              <BasicLiteSwitch v-model="form.hasBackground" />
              <span>背景填充</span>
            </div>
            <BasicColorPicker v-model="form.backgroundColor" :disabled="!form.hasBackground" size="small" />
          </div>

          <div class="theme-row">
            <div class="row-left">
              <BasicLiteSwitch v-model="form.hasText" />
              <span>全局文本</span>
            </div>
            <BasicColorPicker v-model="form.textColor" :disabled="!form.hasText" size="small" />
          </div>

          <div class="theme-row">
            <div class="row-left">
              <BasicLiteSwitch v-model="form.hasGrid" />
              <span>坐标轴网格</span>
            </div>
            <BasicColorPicker v-model="form.gridColor" :disabled="!form.hasGrid" size="small" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="manager-footer">
        <BasicButton @click="updateVisible(false)" cancel>取消</BasicButton>
        <BasicButton primary @click="handleSave">保存方案</BasicButton>
      </div>
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
import { reactive, watch, toRefs } from 'vue';
import BasicModal from '../../base/basic-modal.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicColorPicker from '../../base/basic-color-picker.vue';
import BasicLiteSwitch from '../../base/lite-switch.vue';
import BasicButton from '../c-button/index.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emits = defineEmits(['update:modelValue', 'save']);

const state = reactive({
  form: {
    id: '',
    name: '',
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
    hasBackground: false,
    backgroundColor: '#ffffff',
    hasText: false,
    textColor: '#333333',
    hasGrid: false,
    gridColor: '#eeeeee',
  }
});

const { form } = toRefs(state);

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData) {
      // Edit mode
      Object.assign(state.form, props.editData);
    } else {
      // Create mode - reset
      state.form = {
        id: '',
        name: '',
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
        hasBackground: false,
        backgroundColor: '#ffffff',
        hasText: false,
        textColor: '#333333',
        hasGrid: false,
        gridColor: '#eeeeee',
      };
    }
  }
});

const updateVisible = (val: boolean) => {
  emits('update:modelValue', val);
};

const addColor = () => {
  state.form.color.push('#000000');
};

const removeColor = (index: number) => {
  if (state.form.color.length <= 1) return;
  state.form.color.splice(index, 1);
};

const handleSave = () => {
  if (!state.form.name) {
    state.form.name = '未命名方案';
  }
  // Deep copy to avoid reference issues
  emits('save', JSON.parse(JSON.stringify(state.form)));
};
</script>

<style scoped>
.manager-content {
  padding: 16px 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.count-badge {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 10px;
}

/* Color Grid */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-item {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: visible; /* Allow remove btn to overflow */
}

.color-picker-trigger {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-item:hover .color-picker-trigger {
  transform: scale(1.1);
  border-color: var(--bg-container);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 2;
}

.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: var(--error-color, #ff4d4f);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s;
  z-index: 3;
}

.color-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}

.add-color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.add-color-btn:hover {
  border-color: var(--db-color-button-primary-bg);
  color: var(--db-color-button-primary-bg);
  background: var(--db-color-button-bg-hover);
}

/* Theme Options */
.theme-options {
  background: var(--db-color-button-bg-hover);
  border-radius: 6px;
  padding: 4px;
}

.theme-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.theme-row:last-child {
  border-bottom: none;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-primary);
}

.manager-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
