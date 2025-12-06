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
import { useChartThemesContext } from '../../hooks/chart-themes-context';

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
    icon?: string;
    title?: string;
  };
}>();

const nodeContext = useNodeContext();
const { getCurrentTheme } = useChartThemesContext();

const selectedNodeId = ref('');
const applyMode = ref<'create' | 'update'>('create');
const isCancelled = ref(false);

const handleCancel = () => {
  isCancelled.value = true;
};

const nodes = computed(() => {
  // Filter only ECharts nodes
  const allNodes = unref(nodeContext.getNodes());
  return (allNodes as INode[]).filter((n: INode) =>
    n.component && n.component.includes('apache-e-charts')
  );
});

const chartOption = computed(() => props.data.options || {});
const theme = getCurrentTheme();

const handleApply = () => {
  const optionsStr = JSON.stringify(props.data.options);

  if (applyMode.value === 'create') {
    // Create new node
    // Map chartType to component path if not provided
    let component = props.data.component;
    let schema = props.data.schema;
    let icon = props.data.icon;

    if (!component) {
        // Fallback mapping based on chartType
        const type = props.data.chartType || 'bar';
        component = `../../materials/apache-e-charts/${type}/index.vue`;
        schema = `../../materials/apache-e-charts/${type}/schema/default.ts`;
        icon = `/image/dashboard/editor/materials/apache-e-charts/${type}-simple.png`;
    }

    nodeContext.onAddNode({
      name: props.data.title || `AI Generated ${props.data.chartType || 'Chart'}`,
      icon: icon || '',
      schema: schema || '',
      component: component || '',
      props: {
        code: {
            options: optionsStr
        }
      }
    }, 'root', { x: 500, y: 300 }); // Default position center-ish

  } else {
    // Update existing node
    if (selectedNodeId.value) {
      nodeContext.updateNodeProps(selectedNodeId.value, {
        key: 'code.options',
        value: optionsStr
      }, false);
    }
  }
};
</script>

<template>
  <div class="chart-message-container">
    <div class="chart-header" v-if="props.data.title">
      <span class="chart-title">{{ props.data.title }}</span>
      <span class="chart-type-badge">{{ props.data.chartType }}</span>
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
      <div class="mode-selector">
         <span
           class="mode-item"
           :class="{ active: applyMode === 'create' }"
           @click="applyMode = 'create'"
         >新建</span>
         <span class="divider">/</span>
         <span
           class="mode-item"
           :class="{ active: applyMode === 'update' }"
           @click="applyMode = 'update'"
         >更新</span>
      </div>

      <div class="action-body" v-if="applyMode === 'update'">
        <select v-model="selectedNodeId" class="node-select">
          <option value="" disabled>选择目标图表...</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.name }}
          </option>
        </select>
      </div>

      <div class="action-footer" v-if="!isCancelled">
        <button class="btn-cancel" @click="handleCancel">忽略</button>
        <button
          class="btn-apply"
          :disabled="applyMode === 'update' && !selectedNodeId"
          @click="handleApply"
        >
          应用
        </button>
      </div>
      <div class="action-footer" v-else>
        <span class="cancelled-text">已忽略</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-message-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--db-main-color-card-bg, #2b2b2b);
  border: 1px solid var(--theme-color-gray-600, #444);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;

  .chart-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--theme-color-tran-8);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--theme-color-tran-4);

    .chart-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-color-text);
    }

    .chart-type-badge {
      font-size: 10px;
      padding: 2px 6px;
      background-color: var(--theme-color-tran-12);
      border-radius: 4px;
      color: var(--theme-color-text-secondary);
      text-transform: uppercase;
    }
  }

  .chart-preview {
    height: 260px;
    width: 100%;
    background-color: var(--db-editor-color-canvas-bg, rgba(0, 0, 0, 0.1));
    position: relative;

    .chart {
      width: 100%;
      height: 100%;
    }
  }

  .chart-actions {
    padding: 12px 16px;
    background-color: var(--db-editor-color-panel-bg, #1e1e1e);
    border-top: 1px solid var(--theme-color-gray-600, #444);

    .mode-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 12px;
      color: var(--theme-color-text-secondary);

      .mode-item {
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--theme-color-text);
        }

        &.active {
          color: var(--db-color-button-primary-bg, #409eff);
          font-weight: 600;
        }
      }

      .divider {
        color: var(--theme-color-gray-600);
      }
    }

    .action-body {
      margin-bottom: 12px;

      .node-select {
        width: 100%;
        padding: 6px 10px;
        background-color: var(--theme-color-tran-8);
        border: 1px solid var(--theme-color-gray-600);
        color: var(--theme-color-text);
        border-radius: 6px;
        font-size: 12px;
        outline: none;

        &:focus {
          border-color: var(--db-color-button-primary-bg, #409eff);
        }
      }
    }

    .action-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      align-items: center;

      .btn-cancel {
        padding: 6px 12px;
        background: transparent;
        border: none;
        color: var(--theme-color-text-secondary);
        font-size: 12px;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--theme-color-text);
        }
      }

      .btn-apply {
        padding: 6px 16px;
        background-color: var(--db-color-button-primary-bg, #409eff);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background-color: var(--db-color-button-primary-bg-hover);
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: var(--theme-color-gray-600);
        }
      }

      .cancelled-text {
        font-size: 12px;
        color: var(--theme-color-text-disabled);
        font-style: italic;
      }
    }
  }
}
</style>
