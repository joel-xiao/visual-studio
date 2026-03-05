<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import BaseChart from '../components/BaseChart.vue';

use([CanvasRenderer, RadarChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps<{
  config?: IComponentProps;
}>();

const defaultOption = {
  title: {
    text: 'Basic Radar Chart'
  },
  legend: {
    data: ['Allocated Budget', 'Actual Spending']
  },
  radar: {
    indicator: []
  },
  series: [
    {
      name: '',
      type: 'radar',
      data: []
    }
  ]
};
</script>
