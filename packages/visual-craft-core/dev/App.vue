<template>
  <div class="dev-container">
    <div class="dev-nav">
      <div 
        class="nav-item" 
        :class="{ active: currentPath === 'editor' }"
        @click="currentPath = 'editor'"
      >
        画布编辑器
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentPath === 'data' }"
        @click="currentPath = 'data'"
      >
        数据管理中心
      </div>
    </div>
    
    <div class="dev-content">
      <Editor v-if="currentPath === 'editor'" :data="editorData" :ai-config="aiConfig" />
      <DataCenter v-else-if="currentPath === 'data'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Editor, DataCenter } from '../src/index';

const currentPath = ref('editor');

const aiConfig = {
  runtime: {
    mode: 'builtin',
    builtin: {
      apiKey: 'sk-f6428df10fa843488f78fe715f403ab0',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-max',
      visionModel: 'qwen-vl-max'
    }
  },
  suggestions: {
    suggestions: {
      enabled: false,
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
  padding: 0px;
  height: 100%;
  width: 100%;
  margin: 0;
  background: #000;
  color: #fff;
}

.dev-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dev-nav {
  height: 48px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  border-bottom: 1px solid #333;
  z-index: 1000;
}

.nav-item {
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #3662ec;
  font-weight: 600;
  background: rgba(54, 98, 236, 0.1);
}

.dev-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>
