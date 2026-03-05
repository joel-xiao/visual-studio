<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import BaseChart from '../components/BaseChart.vue';

use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const props = defineProps<{
  config?: IComponentProps;
}>();

const defaultOption = {
  xAxis: {},
  yAxis: {},
  series: [
    {
      symbolSize: 20,
      data: [],
      type: 'scatter'
    }
  ]
};
</script>
