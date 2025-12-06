<script setup lang="ts">
import { ref } from 'vue';
import { NSelect, NButton, NInput, NSpace, NCard } from 'naive-ui';

const sceneOptions = [
  { label: '场景1: 大屏设计', value: 'scene1' },
  // 预留位置
  { label: '场景2: 暂定', value: 'scene2', disabled: true }
];

const selectedScene = ref('scene1');
const generatedCode = ref('');

const generateScene1 = () => {
  // 内部多角色逻辑处理
  // Role 1: Generate base structure
  const baseData = {
    folder: '',
    id: '',
    type: '',
    name: '',
    nodes: [
      {
        parentId: '',
        id: 'root',
        icon: '',
        component: 'root',
        schema: '../../canvas/schema/default.ts',
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
  };

  // Role 2: Enhance with ECharts options (internal logic applied to Role 1 result)
  // 这里模拟 Role 2 对 Role 1 结果的增强
  const enhancedData = JSON.parse(JSON.stringify(baseData));
  if (enhancedData.nodes && enhancedData.nodes.length > 0) {
    enhancedData.nodes[0].props.code = {
      options: {
        title: {
          text: 'ECharts Example',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Sales', 'Marketing'],
          textStyle: {
            color: '#ccc'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            color: '#ccc'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ccc'
          },
          splitLine: {
            lineStyle: {
              color: '#333'
            }
          }
        },
        series: [
          {
            name: 'Sales',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Marketing',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      }
    };
  }

  generatedCode.value = JSON.stringify(enhancedData, null, 2);
};

const onGenerate = () => {
  if (selectedScene.value === 'scene1') {
    generateScene1();
  }
};
</script>

<template>
  <div class="ai-panel">
    <div class="ai-sidebar">
      <n-space vertical size="large">
        <div class="ai-header">
          <h3>AI 智能助手</h3>
          <p class="subtitle">选择场景并生成代码</p>
        </div>

        <n-card title="场景选择" size="small">
          <n-space vertical>
            <n-select v-model:value="selectedScene" :options="sceneOptions" />
            <div class="role-desc">
              <p v-if="selectedScene === 'scene1'">场景1: 自动执行多角色设计流程（布局设计 -> 数据可视化美化）</p>
              <p v-else>更多场景开发中...</p>
            </div>
            <n-button type="primary" block @click="onGenerate">
              生成代码
            </n-button>
          </n-space>
        </n-card>
      </n-space>
    </div>
    <div class="ai-content">
      <n-input
        v-model:value="generatedCode"
        type="textarea"
        placeholder="AI 生成的代码将显示在这里..."
        class="code-output"
        :autosize="{ minRows: 20 }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: var(--db-editor-nav-bar-height);
  right: 0;
  bottom: 0;
  width: var(--db-editor-right-menu-width);
  border-left: 1px solid var(--db-editor-color-canvas);
  background-color: var(--db-editor-color-panel-bg);
  z-index: 100;

  .ai-sidebar {
    width: 100%;
    padding: 12px;
    border-bottom: 1px solid var(--db-border-color);

    .ai-header {
      margin-bottom: 20px;
      h3 {
        margin: 0 0 8px 0;
        color: var(--text-color-primary);
      }
      .subtitle {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 12px;
      }
    }

    .role-desc {
      font-size: 12px;
      color: var(--text-color-secondary);
      margin-bottom: 8px;
    }
  }

  .ai-content {
    flex: 1;
    width: 100%;
    padding: 12px;
    background-color: #1e1e1e; // Dark background for code
    overflow: hidden;

    .code-output {
      height: 100%;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;

      :deep(.n-input__textarea-el) {
        height: 100% !important;
      }
    }
  }
}
</style>
