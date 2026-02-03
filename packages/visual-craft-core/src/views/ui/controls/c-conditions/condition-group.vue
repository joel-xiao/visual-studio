<template>
<div class="condition-group">
  <!-- 逻辑连接器（非第一个组时显示） -->
  <div v-if="!isFirst" class="condition-group-connector">
    <div class="condition-group-logic-selector">
      <BasicBox
        type="group-item"
        class="logic-btn"
        :model-value="parentLogic === 'and'"
        @click="$emit('update:parent-logic', 'and')"
      >
        并且
      </BasicBox>
      <BasicBox
        type="group-item"
        class="logic-btn"
        :model-value="parentLogic === 'or'"
        @click="$emit('update:parent-logic', 'or')"
      >
        或者
      </BasicBox>
    </div>
  </div>

  <!-- 条件组内容 -->
  <div class="condition-group-content">
    <!-- 左侧逻辑选择器（多个表达式时显示） -->
    <div class="condition-group-left">
      <template v-if="group.expressions.length > 1">
        <div class="condition-group-inner-logic">
          <div class="inner-logic-line top" />
          <BasicBox
            type="group-item"
            class="logic-btn-inner"
            :model-value="group.logic === 'and'"
            @click="updateLogic('and')"
          >
            并且
          </BasicBox>
          <BasicBox
            type="group-item"
            class="logic-btn-inner"
            :model-value="group.logic === 'or'"
            @click="updateLogic('or')"
          >
            或者
          </BasicBox>
          <div class="inner-logic-line bottom" />
        </div>
      </template>
    </div>

    <!-- 表达式列表 -->
    <div class="condition-group-expressions">
      <div
        v-for="(expr, index) in group.expressions"
        :key="expr.id"
        class="condition-expression"
      >
        <!-- 连接线 -->
        <div class="expression-connector">
          <div class="connector-dot" />
          <div class="connector-h-line" />
        </div>
        
        <!-- 表达式内容 -->
        <BasicBox type="input" class="expression-content">
          <!-- 添加按钮 -->
          <BasicBox type="hover" class="expression-add-btn" @click="$emit('add-expression')">
            <BasicIcon icon="add" />
          </BasicBox>

          <!-- 字段选择 -->
          <div class="expression-field">
            <BasicInput
              v-model="expr.field"
              placeholder="s"
              @blur="triggerUpdate"
              @update="triggerUpdate"
            />
          </div>

          <!-- 运算符选择 -->
          <div class="expression-operator">
            <BasicSelect
              :model-value="expr.operator"
              :options="operatorOptions"
              @update="(val) => updateOperator(index, val as string)"
            />
          </div>

          <!-- 值输入 -->
          <div class="expression-value">
            <BasicInput
              v-model="expr.value"
              placeholder="值"
              @blur="triggerUpdate"
              @update="triggerUpdate"
            />
          </div>

          <!-- 删除按钮 -->
          <BasicBox type="hover" class="expression-remove-btn" @click="removeExpression(index)">
            <BasicIcon icon="delete" />
          </BasicBox>
        </BasicBox>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import BasicBox from '../../base/basic-box.vue';
import BasicIcon from '../../base/basic-icon.vue';
import BasicInput from '../../base/basic-input.vue';
import BasicSelect from '../../base/basic-select.vue';
import type { IConditionGroup, IConditionExpression, IFieldOption } from '../../../editor/schema/conditions/index';
import { OperatorOptions } from '../../../editor/schema/conditions/index';

interface Props {
  group: IConditionGroup;
  groupIndex: number;
  totalGroups: number;
  isFirst: boolean;
  parentLogic: 'and' | 'or';
  fieldOptions?: IFieldOption[];
}

const props = withDefaults(defineProps<Props>(), {
  fieldOptions: () => []
});

const emit = defineEmits(['update:group', 'update:parent-logic', 'remove', 'add-expression']);

// 格式化运算符选项
const operatorOptions = OperatorOptions.map(opt => ({
  label: opt.label,
  value: opt.value
}));

// 生成唯一ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 创建默认表达式
const createDefaultExpression = (): IConditionExpression => ({
  id: generateId(),
  field: 's',
  operator: 'eq',
  value: '系列一'
});

// 触发更新
const triggerUpdate = () => {
  emit('update:group', { ...props.group });
};

// 更新组内逻辑
const updateLogic = (logic: 'and' | 'or') => {
  emit('update:group', { ...props.group, logic });
};

// 添加表达式
const addExpression = () => {
  const newGroup = {
    ...props.group,
    expressions: [...props.group.expressions, createDefaultExpression()]
  };
  emit('update:group', newGroup);
};

// 更新表达式运算符
const updateOperator = (index: number, operator: string) => {
  const expressions = [...props.group.expressions];
  expressions[index] = { ...expressions[index], operator };
  emit('update:group', { ...props.group, expressions });
};

// 移除表达式
const removeExpression = (index: number) => {
  if (props.group.expressions.length <= 1) {
    emit('remove');
    return;
  }
  
  const expressions = [...props.group.expressions];
  expressions.splice(index, 1);
  emit('update:group', { ...props.group, expressions });
};

// 暴露添加表达式方法
defineExpose({ addExpression });
</script>

<style lang="scss">
#visual-craft-core .condition-group {
  position: relative;

  // 逻辑连接器
  .condition-group-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      width: 1px;
      height: 8px;
      background: var(--db-color-button-primary-bg);
    }
    
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 1px;
      height: 8px;
      background: var(--db-color-button-primary-bg);
    }
  }

  .condition-group-logic-selector {
    display: flex;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .logic-btn {
    padding: 0 16px;
    font-size: 11px;
    height: 28px;
    min-width: auto;
    border-radius: 0;

    &:first-child {
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }
  }

  // 条件组内容
  .condition-group-content {
    display: flex;
    gap: 0;
  }

  .condition-group-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 42px;
    flex-shrink: 0;
    padding: 0;
    position: relative;
  }

  .condition-group-inner-logic {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    
    .inner-logic-line {
      width: 1px;
      height: 12px;
      background: var(--db-color-button-primary-bg);
    }
  }

  .logic-btn-inner {
    padding: 0 6px;
    font-size: 9px;
    height: 20px;
    min-width: auto;
    border-radius: 3px;
  }

  // 表达式列表
  .condition-group-expressions {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 0;
  }

  .condition-expression {
    display: flex;
    align-items: center;
  }

  .expression-connector {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 14px;
    
    .connector-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--db-color-button-primary-bg);
      flex-shrink: 0;
    }

    .connector-h-line {
      width: 9px;
      height: 1px;
      background: var(--db-color-button-primary-bg);
    }
  }

  .expression-content {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px 6px;
    height: auto;
    min-height: 32px;
  }

  .expression-add-btn {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 3px;
    flex-shrink: 0;

    .basic-icon {
      font-size: 9px;
    }
  }

  .expression-field {
    width: 32px;
    flex-shrink: 0;

    .basic-input {
      height: 22px;
      font-size: 11px;
    }
  }

  .expression-operator {
    width: 55px;
    flex-shrink: 0;
  }

  .expression-value {
    flex: 1;
    min-width: 40px;

    .basic-input {
      height: 22px;
      font-size: 11px;
    }
  }

  .expression-remove-btn {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 3px;
    flex-shrink: 0;

    .basic-icon {
      font-size: 9px;
    }

    &:hover {
      color: var(--theme-color-red-500);
    }
  }
}
</style>
