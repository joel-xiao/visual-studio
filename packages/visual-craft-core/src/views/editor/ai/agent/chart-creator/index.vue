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
import { asRecord, isString, pickString, safeParseJSON } from '../../utils/json-utils';

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
  const base = isString(val) ? safeParseJSON(val, {}) : val;
  const obj = asRecord(base) ?? {};
  return { ...obj, backgroundColor: 'transparent' };
};

const chartItems = computed<ChartItem[]>(() => {
  const d = asRecord(props.data) ?? {};
  const charts = d.charts;
  const chartOptions = d.chartOptions;

  if (Array.isArray(charts)) {
    return charts
      .map((c: unknown, idx: number): ChartItem => {
        const cObj = asRecord(c) ?? {};
        const id = cObj.id;
        const title = pickString(cObj, 'title');
        const name = pickString(cObj, 'name');
        const optionsProp = cObj.options;
        const dataProp = cObj.data;
        const themeProp = pickString(cObj, 'theme');

        const key = String(id ?? idx);
        const label = title || name || `图表 ${idx + 1}`;
        const options = optionsProp ?? dataProp ?? c;
        const theme = themeProp;

        return { key, label, options, theme };
      })
      .filter((it: ChartItem) => !!it.key);
  }

  const chartOptionsObj = asRecord(chartOptions);
  if (chartOptionsObj) {
    const entries = Object.entries(chartOptionsObj);
    return entries.map(([key, options], idx): ChartItem => ({
      key,
      label: `图表 ${idx + 1}`,
      options,
      theme: pickString(d, 'theme')
    }));
  }

  const options = d.options ?? d.data ?? d;
  return [{ key: 'single', label: '图表', options, theme: pickString(d, 'theme') }];
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
