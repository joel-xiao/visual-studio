<template>
<div class="c-ultra-compact-industrial">
  <div class="s-main-stack">
    <div 
      v-for="(cond, ci) in conditions" 
      :key="cond.id" 
      class="s-unit"
      :class="{ 'is-active': activeId === cond.id, 'is-disabled': !cond.enabled }"
      @click="activeId = cond.id"
    >
      <div class="s-unit-header">
        <div class="s-active-pin"></div>
        <div class="s-unit-label">
          <input v-model="cond.name" class="s-unit-name-input" placeholder="判定标题" @change="trigger" />
        </div>
        <div class="s-unit-tools">
          <LiteSwitch :model-value="cond.enabled" @update:model-value="v => (cond.enabled = v, trigger())" />
          <div class="s-tool-btn del" @click.stop="removeCond(ci)">
            <BasicIcon icon="mdi:close" />
          </div>
        </div>
      </div>

      <div v-show="activeId === cond.id" class="s-unit-body">
        <template v-for="(group, gi) in cond.groups" :key="group.id">
          
          <div v-if="gi > 0" class="s-logic-bridge" @click.stop="toggleLogic(cond, 'group', gi)">
            <div class="b-line"></div>
            <span class="b-pill" :class="{ 'is-or': cond.logic === 'or' }">
              {{ cond.logic === 'and' ? '并且' : '或者' }}
            </span>
            <div class="b-line"></div>
          </div>

          <div class="s-expr-group">
            <div v-for="(expr, ei) in group.expressions" :key="expr.id" class="s-rule-row">
              <div class="s-rule-rail">
                <div class="rail-path" :class="{ 'is-end': ei === group.expressions.length - 1 }"></div>
                <div 
                  v-if="ei > 0" 
                  class="rail-logic" 
                  :class="{ 'is-or': group.logic === 'or' }"
                  @click.stop="toggleLogic(cond, 'expr', gi, ei)"
                >
                  {{ group.logic === 'and' ? '且' : '或' }}
                </div>
                <div v-else class="rail-point">IF</div>
              </div>

              <div class="s-rule-main-wrap">
                <div class="s-rule-inputs">
                  <div class="s-input-line">
                    <CSelect 
                      class="field-select"
                      size="small"
                      :model-value="expr.field" 
                      :options="DefaultFieldOptions" 
                      @update="v => (expr.field = String(v), trigger())"
                    />
                  </div>
                  <div class="s-input-line lower">
                    <CSelect 
                      class="op-select"
                      size="small"
                      :model-value="expr.operator" 
                      :options="OperatorOptions" 
                      @update="v => (expr.operator = String(v), trigger())"
                    />
                    <CInput 
                      class="val-input"
                      size="small"
                      :model-value="expr.value" 
                      placeholder="判定值"
                      @update="v => (expr.value = String(v), trigger())" 
                    />
                  </div>
                </div>

                <div class="s-rule-actions">
                  <CButton icon="mdi:plus" size="small" @click.stop="addExpr(ci, gi, ei)" />
                  <CButton icon="mdi:minus" size="small" @click.stop="removeExpr(ci, gi, ei)" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="s-effects-shelf">
          <SchemaItems 
            :items="effectItems" 
            :props-data="{ effects: cond.effects }" 
            :schema-type="schemaType"
            @update="(k, s, val) => onUpdateEffect(ci, val)"
          />
        </div>
      </div>
    </div>

    <div class="s-entrance-portal">
       <CButton icon="mdi:plus-circle-outline" style="width: 100%" @click="addCond()">
         新建逻辑判定分支
       </CButton>
    </div>
  </div>
</div>
</template>

<script lang="ts">
export default { name: 'C_CONDITIONS', inheritAttrs: false };
</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { set } from 'lodash';
import { normalizePath } from '../../../../assets/utils';
import LiteSwitch from '../../../ui/base/lite-switch.vue';
import BasicIcon from '../../../ui/base/basic-icon.vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import CInput from '../../../ui/controls/c-input/index.vue';
import CSelect from '../../../ui/controls/c-select/index.vue';
import SchemaItems from '../schema-items.vue';

import { useComponentContext } from '../../hooks/component-context';
import type { IConditionConfig, IChartEffect, EffectType } from '../../schema/conditions/index';
import { OperatorOptions, DefaultFieldOptions } from '../../schema/conditions/index';

export interface Props {
  modelValue?: IConditionConfig[];
  type?: EffectType;
  schemaType?: string;
  effectSchema?: string;
  schemas?: ISchemaPropTypes[];
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  type: 'bar',
  schemaType: '',
  effectSchema: '',
  schemas: undefined
});

const emit = defineEmits(['update', 'update:modelValue']);
const conditions = ref<IConditionConfig[]>([]);
const activeId = ref('');

const { getSchemaByType } = useComponentContext();

const currentEffects = computed(() => {
  let rawSchema: SchemaKeyTypes = [];
  
  if (props.schemas && props.schemas.length > 0) {
    const conditionsSchemaItem = props.schemas.find(s => s.effectSchema);
    if (conditionsSchemaItem && conditionsSchemaItem.effectSchema) {
      rawSchema = conditionsSchemaItem.schema || [];
    }
  }
  
  if (!rawSchema.length && props.effectSchema) {
    rawSchema = getSchemaByType(props.effectSchema, 'conditionsSchema') || [];
  }

  if (Array.isArray(rawSchema)) {
    return rawSchema.map((row: any) => {
      if (Array.isArray(row)) {
        return row.map((item: any) => ({ ...item, ctrl_size: item.ctrl_size || 'small' }));
      }
      return row;
    });
  }
  
  return [];
});

const effectItems = computed(() => [{
  name: 'PANEL_PROPS_WRAP',
  label: '', 
  key: 'effects',
  schema: currentEffects.value
}]);

watch(() => props.modelValue, (v) => {
  const newV = JSON.stringify(v || []);
  const oldV = JSON.stringify(conditions.value);
  if (newV === oldV) return;
  conditions.value = JSON.parse(JSON.stringify(v || []));
  if (conditions.value.length && !activeId.value) activeId.value = conditions.value[0].id;
}, { immediate: true, deep: true });

const gen = () => Math.random().toString(36).slice(2, 11);
const trigger = () => {
  const d = JSON.parse(JSON.stringify(conditions.value));
  emit('update:modelValue', d); emit('update', d);
};
const toggleLogic = (cond: any, type: 'group' | 'expr', gi: number, ei?: number) => {
  if (type === 'expr' && ei !== undefined) {
    const group = cond.groups[gi];
    const currentInner = group.logic;
    const target = currentInner === 'and' ? 'or' : 'and';
    
    if (target === cond.logic) {
      const moved = group.expressions.splice(ei);
      cond.groups.splice(gi + 1, 0, { id: gen(), logic: currentInner, expressions: moved });
    } else {
      const allBefore: any[] = [];
      for (let i = 0; i < gi; i++) allBefore.push(...cond.groups[i].expressions);
      allBefore.push(...group.expressions.slice(0, ei));
      
      const allAfter: any[] = [...group.expressions.slice(ei)];
      for (let i = gi + 1; i < cond.groups.length; i++) allAfter.push(...cond.groups[i].expressions);
      
      const oldOuter = cond.logic;
      cond.logic = target;
      cond.groups = [
        { id: gen(), logic: oldOuter, expressions: allBefore },
        { id: gen(), logic: oldOuter, expressions: allAfter }
      ].filter(g => g.expressions.length > 0);
    }
  } else if (type === 'group') {
    const prev = cond.groups[gi - 1];
    const curr = cond.groups[gi];
    const target = cond.logic === 'and' ? 'or' : 'and';
    
    prev.expressions.push(...curr.expressions);
    prev.logic = target;
    cond.groups.splice(gi, 1);
  }
  trigger();
};

const onUpdateEffect = (ci: number, [key, val]: [string, any]) => {
  if (!conditions.value[ci].effects) conditions.value[ci].effects = {};
  if (!key) {
    Object.assign(conditions.value[ci].effects, val);
  } else {
    const path = normalizePath(key);
    set(conditions.value[ci].effects, path, val);
  }
  trigger();
};

const getDefaultEffects = () => {
  const result: Record<string, any> = {};
  if (Array.isArray(currentEffects.value)) {
    currentEffects.value.forEach((row: any) => {
      if (Array.isArray(row)) {
        row.forEach((item: any) => {
          if (item?.key) {
            result[item.key] = item.default;
          }
        });
      }
    });
  }
  return result;
};

const addCond = () => {
  const n: IConditionConfig = { 
    id: gen(), 
    name: '新逻辑单元', 
    enabled: true, 
    logic: 'and', 
    groups: [{ id: gen(), logic: 'and', expressions: [{ id: gen(), field: 's', operator: 'eq', value: '' }] }], 
    effects: getDefaultEffects() 
  };
  conditions.value.push(n); 
  activeId.value = n.id; 
  trigger();
};
const removeCond = (i: number) => { conditions.value.splice(i, 1); activeId.value = conditions.value[0]?.id || ''; trigger(); };
const addExpr = (ci: number, gi: number, ei: number) => { conditions.value[ci].groups[gi].expressions.splice(ei+1, 0, { id: gen(), field: 's', operator: 'eq', value: '' }); trigger(); };
const removeExpr = (ci: number, gi: number, ei: number) => {
  const g = conditions.value[ci].groups[gi];
  if (g.expressions.length > 1) { g.expressions.splice(ei, 1); } 
  else if (conditions.value[ci].groups.length > 1) { conditions.value[ci].groups.splice(gi, 1); } 
  else { g.expressions[ei] = { id: gen(), field: 's', operator: 'eq', value: '' }; }
  trigger();
};
</script>

<style lang="scss">
#visual-craft-core .c-ultra-compact-industrial {
  width: 198px; color: var(--theme-color-text-secondary); font-family: system-ui, sans-serif;

  .s-main-stack { display: flex; flex-direction: column; }

  /* Unit Segment Case: Precision Optics Focus */
  .s-unit {
    border-bottom: 1px solid var(--theme-color-border); 
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    opacity: 0.6;
    position: relative;
    
    &.is-active { 
      opacity: 1; 
      border-bottom-color: rgba(54, 98, 236, 0.4);
      z-index: 5;
      
      /* Subtle rim light for depth */
      &::before {
        content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px;
        background: linear-gradient(90deg, rgba(54, 98, 236, 0.5), transparent);
      }
    }
    &.is-disabled { opacity: 0.3; filter: grayscale(1); }
  }

  /* Header Section: Interactive Light Strip */
  .s-unit-header {
    display: flex; align-items: center; height: 36px; padding: 0; position: relative;
    .s-active-pin { 
      position: absolute; left: 0; top: 12px; bottom: 12px; width: 4px; 
      border-radius: 0 4px 4px 0; background: transparent; 
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      
      .is-active & { 
        top: 0; bottom: 0;
        /* Premium Blue-Cyan Gradient */
        background: linear-gradient(to bottom, #3662EC, #22d3ee); 
        box-shadow: 2px 0 12px rgba(54, 98, 236, 0.5); 
      } 
    }
    .s-unit-label { 
      flex: 1; padding-left: 6px; 
      transition: transform 0.3s ease;
      .is-active & { transform: translateX(2px); } /* Tactile Shift */
    }
    .s-unit-name-input { 
      background: none; border: none; font-size: 11px; font-weight: 800; width: 100%; outline: none; 
      color: #666; transition: 0.2s;
      .is-active & { color: #fff; text-shadow: 0 0 8px rgba(255,255,255,0.1); } 
    }
    .s-unit-tools { display: flex; align-items: center; gap: 6px; padding-right: 4px; }
    .s-tool-btn { font-size: 14px; color: #555; cursor: pointer; opacity: 0.5; transition: 0.2s; &:hover { opacity: 1; color: #f43f5e; } }
  }

  .s-unit-body { padding: 4px 6px 12px 0px; }

  /* Logic Bridges */
  .s-logic-bridge {
    display: flex; align-items: center; gap: 4px; margin: 12px 0; cursor: pointer;
    .b-line { flex: 1; height: 1px; background: var(--theme-color-border); opacity: 0.15; }
    .b-pill { font-size: 9px; font-weight: 900; color: var(--theme-color-blue-700); opacity: 0.65; &.is-or { color: #f59e0b; } }
  }

  /* Expression Groups */
  .s-expr-group { display: flex; flex-direction: column; gap: 10px; }
  .s-rule-row { display: flex; align-items: stretch; position: relative; gap: 2px; }

  /* The Rail System */
  .s-rule-rail {
    width: 20px; position: relative; display: flex; flex-direction: column; align-items: center; flex: none;
    .rail-path { position: absolute; left: 10px; top: 0; bottom: -8px; width: 1px; background: var(--theme-color-border); opacity: 0.15; &.is-end { bottom: 65%; } }
    .rail-logic { position: absolute; top: 16px; z-index: 5; background: #1a1a1a; font-size: 11px; font-weight: 900; color: var(--theme-color-blue-700); padding: 0 2px; cursor: pointer; &.is-or { color: #f59e0b; } }
    .rail-point { position: absolute; top: 4px; font-size: 11px; font-weight: 900; color: #444; }
  }

  /* Input Composition Area */
  .s-rule-main-wrap { flex: 1; display: flex; align-items: stretch; gap: 2px; min-width: 0; }
  .s-rule-inputs { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .s-input-line { display: flex; align-items: center; gap: 2px; }

  /* Override Shared Components */
  .field-select { flex: 1; }
  .op-select { width: 56px; flex: none; }
  .val-input { flex: 1; }

  /* Vertical Action Hub: Alignment with CButton */
  .s-rule-actions { 
    display: flex; flex-direction: column; width: 24px; flex: none;
    gap: 2px; 
    
    .c-button { width: 22px; }
  }

  /* Response Effect Shelf: Standard Renderer Styles */
  .s-effects-shelf { 
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.04); 
    .schema-props-layout-pro {
      margin: 0px;
    }
  }

  /* Portal: Integrated CButton Entrance */
  .s-entrance-portal {
    padding-top: 6px;
    display: flex; justify-content: center; margin-top: 4px;
    .c-button-text { letter-spacing: 0.3px; font-weight: 800; }
  }
}
</style>
