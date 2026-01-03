<template>
<Editor :data="editorData" :ai-config="aiConfig" />
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Editor } from '../src/index';

const aiConfig = {
  runtime: {
    mode: 'builtin' as const,
    builtin: {
      apiKey: '',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-max',
      visionModel: 'qwen-vl-max'
    }
  },
  suggestions: {
    suggestions: {
      enabled: true,
      maxAISuggestions: 3,
      maxPresetSuggestions: 6
    }
  }
};

const editorData = reactive<IEditorData>({
  folder: '',
  id: '',
  type: '',
  name: 'core-dev',
  nodes: [
    {
      parentId: '',
      id: 'root',
      component: 'CANVAS_ROOT',
      schema: 'CANVAS_ROOT',
      name: '根容器',
      width: 1000,
      height: 600,
      radius: [0, 0, 0, 0],
      type: '',
      x: 0,
      y: 0,
      z: 0,
      select: true,
      lock: false,
      props: {
        layout: {
          width: 1000,
          height: 600
        },
        fill: {
          color: 'hsla(0, 0%, 13% , 1)'
        }
      }
    }
  ]
});
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
}
</style>
