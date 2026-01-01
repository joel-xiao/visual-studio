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
  return typeof options === 'string' ? safeParseJSON(options, {}) : (options || {});
});
</script>

<template>
  <div class="chart-preview-box">
    <v-chart
      class="chart"
      :option="chartOption"
      :theme="theme"
      autoresize
    />
  </div>
</template>

<style scoped lang="scss">
.chart-preview-box {
  height: 240px;
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.1);
  
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>


