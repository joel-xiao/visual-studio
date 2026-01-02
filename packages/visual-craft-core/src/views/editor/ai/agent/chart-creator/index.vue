<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAIContext } from '../../hooks/core/use-ai-context';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart, LineChart, PieChart, RadarChart, ScatterChart,
  CandlestickChart, MapChart, EffectScatterChart
} from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent, DataZoomComponent, VisualMapComponent
} from 'echarts/components';
import { safeParseJSON } from '../../utils/json-utils';

use([
  CanvasRenderer, BarChart, LineChart, PieChart, RadarChart, ScatterChart,
  CandlestickChart, MapChart, EffectScatterChart, TitleComponent,
  TooltipComponent, LegendComponent, GridComponent, DatasetComponent,
  TransformComponent, DataZoomComponent, VisualMapComponent
]);

const props = defineProps<{
  data: {
    options?: Record<string, unknown> | string;
    chartOptions?: Record<string, unknown>;
    theme?: string;
  };
}>();

const aiContext = useAIContext();
const baseTheme = computed(() => props.data.theme || aiContext.chartThemesContext.getCurrentTheme().value);

type ChartItem = {
  key: string;
  label: string;
  options: unknown;
  theme?: string;
};

const normalizeOptions = (val: unknown) => {
  const base = typeof val === 'string' ? safeParseJSON(val, {}) : (val || {});
  if (!base || typeof base !== 'object' || Array.isArray(base)) return { backgroundColor: 'transparent' };
  return { ...(base as Record<string, unknown>), backgroundColor: 'transparent' };
};

const chartItems = computed<ChartItem[]>(() => {
  const d = (props.data || {}) as unknown as Record<string, unknown>;
  const charts = d.charts;
  const chartOptions = d.chartOptions;

  if (Array.isArray(charts)) {
    return charts
      .map((c: unknown, idx: number): ChartItem => {
        const cObj = c && typeof c === 'object' ? (c as Record<string, unknown>) : {};
        const id = cObj['id'];
        const title = cObj['title'];
        const name = cObj['name'];
        const optionsProp = cObj['options'];
        const dataProp = cObj['data'];
        const themeProp = cObj['theme'];

        const key = String((typeof id === 'string' || typeof id === 'number') ? id : idx);
        const label = typeof title === 'string'
          ? title
          : (typeof name === 'string' ? name : `图表 ${idx + 1}`);
        const options = optionsProp ?? dataProp ?? c;
        const theme = typeof themeProp === 'string' ? themeProp : undefined;

        return { key, label, options, theme };
      })
      .filter((it: ChartItem) => !!it.key);
  }

  if (chartOptions && typeof chartOptions === 'object' && !Array.isArray(chartOptions)) {
    const entries = Object.entries(chartOptions as Record<string, unknown>);
    return entries.map(([key, options], idx): ChartItem => ({
      key,
      label: `图表 ${idx + 1}`,
      options,
      theme: typeof d.theme === 'string' ? d.theme : undefined
    }));
  }

  const options = d.options ?? d.data ?? d;
  return [{ key: 'single', label: '图表', options, theme: typeof d.theme === 'string' ? d.theme : undefined }];
});

const activeKey = ref<string>('');

watch(
  chartItems,
  (items: ChartItem[]) => {
    if (!items.length) {
      activeKey.value = '';
      return;
    }
    const exists = items.some(it => it.key === activeKey.value);
    if (!exists) activeKey.value = items[0].key;
  },
  { immediate: true }
);

const activeItem = computed<ChartItem | undefined>(() => chartItems.value.find(it => it.key === activeKey.value) || chartItems.value[0]);
const theme = computed(() => activeItem.value?.theme || baseTheme.value);
const chartRenderKey = computed(() => `${activeKey.value || 'empty'}:${theme.value || 'default'}`);

const chartOption = computed(() => {
  return normalizeOptions(activeItem.value?.options);
});
</script>

<template>
  <div class="chart-preview">
    <div v-if="chartItems.length > 1" class="chart-header">
      <div class="chart-title">
        <span class="title-text">{{ activeItem?.label || '图表' }}</span>
        <span class="title-badge">{{ chartItems.length }}</span>
      </div>

      <div class="chart-tabs" role="tablist" aria-label="图表切换">
        <button
          v-for="item in chartItems"
          :key="item.key"
          class="chart-tab"
          :class="{ active: item.key === activeKey }"
          type="button"
          role="tab"
          :aria-selected="item.key === activeKey"
          @click="activeKey = item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="chart-body">
      <v-chart
        :key="chartRenderKey"
        class="chart"
        :option="chartOption"
        :theme="theme"
        :update-options="{ notMerge: true }"
        autoresize
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-preview {
  width: 100%;
  height: 260px;
  padding: 10px 10px 12px 10px;
  background: var(--theme-color-tran-6);
  border: 1px solid var(--theme-color-tran-8);
  border-radius: var(--border-radius-8);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
}

.title-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--theme-color-text);
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.title-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--theme-color-text-secondary);
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--theme-color-tran-10);
  background: var(--theme-color-tran-6);
  opacity: 0.9;
}

.chart-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding: 4px;
  border-radius: 999px;
  background: var(--theme-color-tran-6);
  border: 1px solid var(--theme-color-tran-10);
  min-width: 0;

  &::-webkit-scrollbar {
    height: 0;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }
}

.chart-tab {
  height: 24px;
  padding: 0 10px;
  font-size: 11px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--theme-color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;

  &:hover {
    color: var(--theme-color-text);
    background: var(--theme-color-tran-10);
  }

  &.active {
    color: var(--theme-color-text);
    background: rgba(64, 158, 255, 0.22);
    border-color: rgba(64, 158, 255, 0.35);
  }
}

.chart-body {
  flex: 1;
  min-height: 0;
  border-radius: var(--border-radius-8);
  overflow: hidden;
  background: transparent;
  border: 1px solid var(--theme-color-tran-8);
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
