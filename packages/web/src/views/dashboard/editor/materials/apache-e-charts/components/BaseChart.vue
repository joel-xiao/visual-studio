<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import VChart from 'vue-echarts';
import { useChartOptions } from '../composables/use-chart-options';

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
