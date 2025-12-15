<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
import { useChartOptions } from '../composables/use-chart-options';
import { useChartThemesContext } from '../../../hooks/chart-themes-context';

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
  config?: IComponentProps;
  defaultOption: Record<string, unknown>;
}>();

const { option } = useChartOptions(props, props.defaultOption);
</script>

<style scoped>
.chart {
  height: var(--node-height);
  width: var(--node-width);
}
</style>
