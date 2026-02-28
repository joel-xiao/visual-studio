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
      data: [
        { name: 'a' },
        { name: 'b' },
        { name: 'a1' },
        { name: 'a2' },
        { name: 'b1' },
        { name: 'c' }
      ],
      links: [
        { source: 'a', target: 'a1', value: 5 },
        { source: 'a', target: 'a2', value: 3 },
        { source: 'b', target: 'b1', value: 8 },
        { source: 'a', target: 'b1', value: 3 },
        { source: 'b1', target: 'a1', value: 1 },
        { source: 'b1', target: 'c', value: 2 }
      ]
    }
  ]
};
</script>
