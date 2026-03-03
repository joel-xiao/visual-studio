<template>
  <BaseChart :config="config" :default-option="defaultOption" />
</template>

<script setup lang="ts">
import BaseChart from '../components/BaseChart.vue';

const props = defineProps<{
  config?: IComponentProps;
}>();

const data = {
  name: 'flare',
  children: [
    {
      name: 'analytics',
      children: [
        {
          name: 'cluster',
          children: [
            { name: 'AgglomerativeCluster', value: 3938 },
            { name: 'CommunityStructure', value: 3812 },
            { name: 'HierarchicalCluster', value: 6714 },
            { name: 'MergeEdge', value: 743 }
          ]
        },
        {
          name: 'graph',
          children: [
            { name: 'BetweennessCentrality', value: 3534 },
            { name: 'LinkDistance', value: 5731 },
            { name: 'MaxFlowMinCut', value: 7840 },
            { name: 'ShortestPath', value: 5914 },
            { name: 'SpanningTree', value: 3416 }
          ]
        },
        {
          name: 'optimization',
          children: [{ name: 'AspectRatioBanker', value: 7074 }]
        }
      ]
    },
    {
      name: 'animate',
      children: [
        { name: 'Easing', value: 17010 },
        { name: 'FunctionSequence', value: 5842 },
        {
          name: 'interpolate',
          children: [
            { name: 'ArrayInterpolator', value: 1983 },
            { name: 'ColorInterpolator', value: 2047 },
            { name: 'DateInterpolator', value: 1375 },
            { name: 'NumberInterpolator', value: 1382 },
            { name: 'PointInterpolator', value: 1675 },
            { name: 'RectangleInterpolator', value: 2042 }
          ]
        },
        { name: 'ISchedulable', value: 1041 },
        { name: 'Parallel', value: 5176 },
        { name: 'Pause', value: 449 },
        { name: 'Scheduler', value: 5593 },
        { name: 'Sequence', value: 5534 },
        { name: 'Transition', value: 9201 },
        { name: 'Transitioner', value: 19975 },
        { name: 'TransitionEvent', value: 1116 },
        { name: 'Tween', value: 6006 }
      ]
    }
  ]
};

const defaultOption = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'tree',
      data: [data],
      top: '1%',
      left: '7%',
      bottom: '1%',
      right: '20%',
      symbolSize: 7,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 9
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      emphasis: {
        focus: 'descendant'
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750
    }
  ]
};
</script>
