<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import BaseChart from '../components/BaseChart.vue';

const props = defineProps<{
  config?: IComponentProps;
}>();

const defaultOption = {
  series: [
    {
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency'
      },
      data: [],
      links: []
    }
  ]
};
</script>
