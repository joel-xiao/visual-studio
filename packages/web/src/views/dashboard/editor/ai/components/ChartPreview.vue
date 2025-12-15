<script setup lang="ts">
/// <reference types="../../types/node" />
import { ref, computed, unref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CandlestickChart,
  MapChart,
  EffectScatterChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components';
import { useNodeContext } from '../../hooks/node-context';
import { useComponentContext } from '../../hooks/component-context';
import { useChartThemesContext } from '../../hooks/chart-themes-context';
import CSelect from '../../../ui/controls/c-select/index.vue';
import CButton from '../../../ui/controls/c-button/index.vue';
import CIcon from '../../../ui/controls/c-icon/index.vue';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CandlestickChart,
  MapChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
  VisualMapComponent
]);

const props = defineProps<{
  data: {
    options: Record<string, unknown>;
    chartType: string;
    component?: string;
    schema?: string;
    title?: string;
    name?: string;
    id?: string;
    theme?: string;
  };
}>();

const nodeContext = useNodeContext();
const { getCurrentTheme } = useChartThemesContext();

const selectedNodeId = ref('');
const applyMode = ref<'create' | 'update'>('create');

const currentSelected = unref(nodeContext.getSelectedNodes());
if (currentSelected.length === 1) {
    const node = currentSelected[0];
    const isECharts = node.component && (node.component.includes('apache-e-charts') || node.component.includes('APACHE_ECHARTS'));

    if (isECharts) {
        selectedNodeId.value = node.id;
        applyMode.value = 'update';
    } else {
        applyMode.value = 'create';
    }
}

const isCancelled = ref(false);
const isApplied = ref(false);

const handleCancel = () => {
  isCancelled.value = true;
};

const nodes = computed(() => {
  const allNodes = unref(nodeContext.getNodes());
  return (allNodes as any[]).filter((n: any) =>
    n.component && n.component.includes('APACHE_ECHARTS')
  );
});

const selectOptions = computed(() => {
  return nodes.value.map(node => ({
    label: node.name,
    value: node.id
  }));
});

const getResolvedOptions = (): Record<string, any> => {
  let opts: any = props.data.options || props.data;
  let attempts = 0;

  while (attempts < 3) {
    if (!opts) return {};

    if (typeof opts === 'string') {
      try {
         opts = JSON.parse(opts);
      } catch (e) {
         console.warn('[ChartPreview] Failed to parse options string:', e);
         return {};
      }
    }

    if (typeof opts === 'object') {
        if ('options' in opts && typeof opts.options === 'object') {
            opts = opts.options;
            attempts++;
            continue;
        }

        if (opts.xAxis || opts.yAxis || opts.series || opts.dataset || opts.title || opts.angleAxis || opts.radiusAxis || opts.radar) {
            return opts;
        }

        if ('data' in opts && typeof opts.data === 'object' && !Array.isArray(opts.data)) {
             opts = opts.data;
             attempts++;
             continue;
        }
    }

    attempts++;
  }

  return opts && typeof opts === 'object' ? opts : {};
};

const chartOption = computed(() => getResolvedOptions());
const globalTheme = getCurrentTheme();
const theme = computed(() => props.data.theme || globalTheme.value);

const normalizeOptions = (options: any): string => {
  if (typeof options === 'string') {
    return options;
  }
  return JSON.stringify(options);
};

const handleApply = () => {
  const options = getResolvedOptions();
  const optionsStr = normalizeOptions(options);

  if (applyMode.value === 'create') {
    let component = props.data.component;
    let schema = props.data.schema;

    if (!component) {
        component = 'APACHE_ECHARTS_BAR_SIMPLE';
        schema = 'APACHE_ECHARTS_BAR_SIMPLE';
    }

    const { getComponentProps } = useComponentContext();
    const defaultProps = getComponentProps(schema || 'APACHE_ECHARTS_BAR_SIMPLE');

    nodeContext.onAddNode({
      name: props.data.title || `AI Generated ${props.data.chartType || 'Chart'}`,
      schema: schema || '',
      component: component || '',
      props: {
        ...defaultProps,
        code: {
            ...defaultProps?.code,
            options: optionsStr
        }
      }
    }, 'root', { x: 500, y: 300 });

  } else {
    if (selectedNodeId.value) {
      nodeContext.updateNodeProps(selectedNodeId.value, {
        key: 'code.options',
        value: optionsStr
      }, false);
    }
  }

  isApplied.value = true;
};

</script>

<template>
  <div class="chart-message-container">
    <div v-if="props.data && (props.data.title || props.data.name)" class="chart-header">
      <div class="header-left">
        <span class="chart-title">{{ props.data.title || props.data.name }}</span>
        <span class="chart-type-badge">{{ props.data.chartType }}</span>
      </div>
    </div>

    <div class="chart-preview">
      <v-chart
        class="chart"
        :option="chartOption"
        :theme="theme"
        autoresize
      />
    </div>

    <div class="chart-actions">
      <div class="mode-segment-control">
        <div
          class="segment-item"
          :class="{ active: applyMode === 'create' }"
          @click="applyMode = 'create'"
        >新建</div>
        <div
          class="segment-item"
          :class="{ active: applyMode === 'update' }"
          @click="applyMode = 'update'"
        >更新</div>
        <div class="segment-glider" :style="{ transform: applyMode === 'create' ? 'translateX(0)' : 'translateX(100%)' }"></div>
      </div>

      <div v-if="applyMode === 'update'" class="action-body">
        <CSelect
          v-model="selectedNodeId"
          :options="selectOptions.length > 0 ? selectOptions : [{ label: '选择目标图表...', value: '', splitLine: true }]"
        />
      </div>

      <div v-if="!isCancelled && !isApplied" class="action-footer">
        <CButton cancel @click="handleCancel">取消</CButton>
        <CButton
          primary
          :disabled="applyMode === 'update' && !selectedNodeId"
          @click="handleApply"
        >
          应用到画布
        </CButton>
      </div>
      <div v-else-if="isApplied" class="action-footer">
        <span class="status-text success">
          <CIcon icon="mdi:check" />
          <span>已应用</span>
        </span>
      </div>
      <div v-else class="action-footer">
        <span class="status-text disabled">已取消</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-message-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 12px;
  overflow: visible;
  background: transparent;
  border: none;
  box-shadow: none;
  margin-top: 8px;
  transition: none;
  display: block;

  .chart-header {
    padding: 0 0 8px 0;
    margin-bottom: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background: transparent;

    .header-left {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .chart-title {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--theme-color-text);
    }

    .chart-type-badge {
      font-size: 9.5px;
      padding: 2px 7px;
      background: rgba(64, 158, 255, 0.15);
      color: var(--db-color-button-primary-bg);
      border-radius: 5px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.25px;
    }
  }

  .chart-preview {
    height: 220px;
    width: 100%;
    min-width: 0;
    flex-shrink: 0;
    background: transparent;
    position: relative;
    overflow: hidden;
    margin: 0;

    .chart {
      width: 100%;
      height: 100%;
      min-width: 0;
      position: relative;
    }
  }

  .chart-actions {
    padding: 9px 0 0 0;
    margin-top: 9px;
    background: transparent;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 9px;
    width: 100%;
    min-width: 0;

    .mode-segment-control {
      display: flex;
      position: relative;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(8px);
      border-radius: 6px;
      padding: 2px;
      width: fit-content;
      border: 1px solid rgba(255, 255, 255, 0.08);

      .segment-item {
        position: relative;
        z-index: 2;
        padding: 4px 13px;
        font-size: 11px;
        font-weight: 500;
        color: var(--theme-color-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 4px;

        &:hover:not(.active) {
          color: var(--theme-color-text);
        }

        &.active {
          color: var(--db-color-button-primary-bg);
          font-weight: 600;
        }
      }

      .segment-glider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: calc(50% - 2px);
        height: calc(100% - 4px);
        background: rgba(64, 158, 255, 0.15);
        border-radius: 4px;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1;
      }
    }

    .action-body {
      margin-top: 3px;

      :deep(.c-select) {
        width: 100%;
      }
    }

    .action-footer {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      align-items: center;
      margin-top: 3px;

      :deep(.c-button) {
        font-size: 11px;
        min-height: 26px;
        padding: 0 12px;
      }

      .status-text {
        font-size: 11.5px;
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 600;

        &.success {
          color: #67c23a;
          text-shadow: 0 1px 2px rgba(103, 194, 58, 0.3);

          .iconfont {
            filter: drop-shadow(0 1px 2px rgba(103, 194, 58, 0.3));
          }
        }
        &.disabled {
          color: var(--theme-color-text-disabled);
          font-style: italic;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>

