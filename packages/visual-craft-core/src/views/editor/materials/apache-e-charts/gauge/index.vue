<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import BaseChart from '../components/BaseChart.vue';

const props = defineProps<{
  config?: IComponentProps;
}>();

const defaultOption = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  series: [
    {
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}'
      },
      data: []
    }
  ]
};
</script>
