<script setup lang="ts">
/// <reference types="../../../types/node" />
import { computed } from 'vue';
import { useAIContext } from '../../hooks/core/use-ai-context';
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
import CButton from '../../../../ui/controls/c-button/index.vue';
import { safeParseJSON } from '../../utils/json-utils';

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

// 通过 context 获取主题（如果需要）
const aiContext = useAIContext();
const { chartThemesContext } = aiContext;
const { getCurrentTheme } = chartThemesContext;

// 主题通过 context 获取，如果没有则使用默认值
const globalTheme = getCurrentTheme();
const theme = computed(() => props.data.theme || globalTheme.value);

// 渲染图表配置
const chartOption = computed(() => {
  const options = props.data?.options;
  if (typeof options === 'string') {
    return safeParseJSON(options, {});
  }
  return options || {};
});

// 只负责 emit 数据，不处理任何逻辑
const emit = defineEmits<{
  apply: [data: typeof props.data];
}>();

const handleApply = () => {
  // 直接 emit 原始数据，由 apply 函数处理所有逻辑
  emit('apply', props.data);
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
      <div class="action-footer">
        <CButton primary @click="handleApply">
          应用到画布
        </CButton>
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

    .action-footer {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      align-items: center;

      :deep(.c-button) {
        font-size: 11px;
        min-height: 26px;
        padding: 0 12px;
      }
    }
  }
}
</style>

