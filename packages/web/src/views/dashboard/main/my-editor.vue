<template>
  <Editor :data="editorData" :ai-config="aiConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Editor } from 'visual-craft-core';

const aiConfig = {
  runtime: {
    mode: 'builtin' as const,
    builtin: {
      apiKey: 'sk-f6428df10fa843488f78fe715f403ab0',
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

const editorData = ref<IEditorData>({
  folder: '',
  id: '',
  type: '',
  name: '',
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

<style lang="scss"></style>
