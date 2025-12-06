<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ref, watch } from 'vue';

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

// provide(THEME_KEY, 'dark');

const props = defineProps<{
  config?: IComponentProps;
}>();

const option = ref({
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
});

// Merge props into option if needed
 watch(() => props.config, (newVal) => {
  if (newVal) {
    console.log(props.config)
    // update option logic
  }
 }, { deep: true });
</script>

<style>
.chart {
  height: var(--node-height);
  width: var(--node-width);
}
</style>
