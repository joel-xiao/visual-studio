<script setup lang="ts">
import { computed } from 'vue';
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
    options: Record<string, any> | string;
    theme?: string;
  };
}>();

const aiContext = useAIContext();
const theme = computed(() => props.data.theme || aiContext.chartThemesContext.getCurrentTheme().value);

const chartOption = computed(() => {
  const options = props.data?.options;
  const base = typeof options === 'string' ? safeParseJSON(options, {}) : (options || {});
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    return { backgroundColor: 'transparent' };
  }
  return { ...(base as Record<string, any>), backgroundColor: 'transparent' };
});
</script>

<template>
  <div class="chart-preview">
    <v-chart
      class="chart"
      :option="chartOption"
      :theme="theme"
      autoresize
    />
  </div>
</template>

<style scoped lang="scss">
.chart-preview {
  width: 100%;
  height: 260px;
  padding: 10px;
  background: transparent;
  border: none;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
