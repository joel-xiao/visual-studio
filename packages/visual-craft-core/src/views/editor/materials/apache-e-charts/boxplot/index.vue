<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import BaseChart from '../components/BaseChart.vue';

const props = defineProps<{
  config?: IComponentProps;
}>();

const defaultOption = {
  title: [
    {
      text: 'Michelson-Morley Experiment',
      left: 'center'
    },
    {
      text: 'upper: Q3 + 1.5 * IQR \nlower: Q1 - 1.5 * IQR',
      borderColor: '#999',
      borderWidth: 1,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 14,
        lineHeight: 20
      },
      left: '10%',
      top: '90%'
    }
  ],
  dataset: [
    {
      source: []
    },
    {
      transform: {
        type: 'boxplot',
        config: { itemNameFormatter: 'expr {value}' }
      }
    },
    {
      fromDatasetIndex: 1,
      fromTransformResult: 1
    }
  ],
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    nameGap: 30,
    splitArea: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    name: 'km/s minus 299,000',
    splitArea: {
      show: true
    }
  },
  series: [
    {
      name: 'boxplot',
      type: 'boxplot',
      datasetIndex: 1
    },
    {
      name: 'outlier',
      type: 'scatter',
      datasetIndex: 2
    }
  ]
};
</script>
