<script setup lang="ts">
import { ref, nextTick, onMounted, reactive } from 'vue';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  type?: 'text' | 'code' | 'action';
  actions?: { label: string; value: string; disabled?: boolean }[];
}

const messages = ref<ChatMessage[]>([]);
const inputValue = ref('');
const chatContainerRef = ref<HTMLElement>();

// Scene Options
const sceneOptions = [
  { label: '场景1: 大屏设计', value: 'scene1' },
  { label: '场景2: 暂定', value: 'scene2', disabled: true }
];

// Initialize Chat
onMounted(() => {
  addMessage('ai', '你好！我是 AI 智能助手。请选择一个场景开始设计：', 'action', sceneOptions);
});

const addMessage = (role: 'user' | 'ai', content: string, type: 'text' | 'code' | 'action' = 'text', actions?: { label: string; value: string; disabled?: boolean }[]) => {
  messages.value.push({
    id: Date.now().toString(),
    role,
    content,
    type,
    actions
  });
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};

const handleActionClick = (actionValue: string) => {
  if (actionValue === 'scene1') {
    addMessage('user', '开始场景1: 大屏设计');
    processScene1();
  }
};

const handleSend = () => {
  if (!inputValue.value.trim()) return;
  addMessage('user', inputValue.value);
  const text = inputValue.value;
  inputValue.value = '';

  // Simple mock response for free text
  setTimeout(() => {
    addMessage('ai', `收到: "${text}"。目前仅支持点击场景按钮进行生成。`);
  }, 500);
};

// --- Generation Logic ---

const generateScene1Data = () => {
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

  // Role 2: Enhance with ECharts options
  const enhancedData = JSON.parse(JSON.stringify(baseData));
  if (enhancedData.nodes && enhancedData.nodes.length > 0) {
    enhancedData.nodes[0].props.code = {
      options: {
        title: {
          text: 'ECharts Example',
          textStyle: { color: '#fff' }
        },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['Sales', 'Marketing'],
          textStyle: { color: '#ccc' }
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
          axisLabel: { color: '#ccc' }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#ccc' },
          splitLine: { lineStyle: { color: '#333' } }
        },
        series: [
          {
            name: 'Sales',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Marketing',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      }
    };
  }
  return JSON.stringify(enhancedData, null, 2);
};

const processScene1 = async () => {
  addMessage('ai', '正在执行多角色设计流程...');

  await new Promise(r => setTimeout(r, 800));
  addMessage('ai', '角色1 (布局设计师): 已生成基础大屏结构。');

  await new Promise(r => setTimeout(r, 800));
  addMessage('ai', '角色2 (数据可视化专家): 已补充 ECharts 图表配置并进行美化。');

  await new Promise(r => setTimeout(r, 500));
  const code = generateScene1Data();
  addMessage('ai', code, 'code');
  addMessage('ai', '代码已生成完毕！');
};

</script>

<template>
  <div class="ai-panel">
    <div class="chat-header">
      <h3>AI 助手</h3>
    </div>

    <div class="chat-container" ref="chatContainerRef">
      <div v-for="msg in messages" :key="msg.id" :class="['message-row', msg.role]">
        <div class="avatar">{{ msg.role === 'ai' ? '🤖' : '👤' }}</div>
        <div class="message-content">
          <div v-if="msg.type === 'text'" class="text-bubble">{{ msg.content }}</div>

          <div v-else-if="msg.type === 'code'" class="code-block">
            <pre>{{ msg.content }}</pre>
          </div>

          <div v-else-if="msg.type === 'action'" class="action-bubble">
            <p>{{ msg.content }}</p>
            <div class="action-buttons">
              <button
                v-for="action in msg.actions"
                :key="action.value"
                :disabled="action.disabled"
                @click="!action.disabled && handleActionClick(action.value)"
                class="action-btn"
                :class="{ disabled: action.disabled }"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="inputValue"
        placeholder="输入指令..."
        @keydown.enter.prevent="handleSend"
      ></textarea>
      <button class="send-btn" @click="handleSend">
        <i class="iconfont icon-send"></i> 发送
      </button>
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
  color: var(--theme-color-text);

  .chat-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--db-border-color, #333);
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .message-row {
      display: flex;
      gap: 8px;
      max-width: 100%;

      &.user {
        flex-direction: row-reverse;
        .message-content {
          align-items: flex-end;
        }
        .text-bubble {
          background-color: var(--db-color-button-primary-bg, #1890ff);
          color: white;
          border-radius: 8px 0 8px 8px;
        }
      }

      &.ai {
        .text-bubble {
          background-color: var(--db-color-input-background, #2c2c2c);
          border: 1px solid var(--db-border-color, #333);
          border-radius: 0 8px 8px 8px;
        }
      }

      .avatar {
        width: 24px;
        height: 24px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .message-content {
        display: flex;
        flex-direction: column;
        max-width: calc(100% - 40px);
        overflow: hidden;
      }

      .text-bubble {
        padding: 8px 12px;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-all;
      }

      .code-block {
        background-color: #1e1e1e;
        border-radius: 4px;
        padding: 8px;
        border: 1px solid #333;
        width: 100%;
        overflow-x: auto;

        pre {
          margin: 0;
          font-family: 'Menlo', 'Monaco', monospace;
          font-size: 11px;
          color: #d4d4d4;
        }
      }

      .action-bubble {
        background-color: var(--db-color-input-background, #2c2c2c);
        padding: 12px;
        border-radius: 0 8px 8px 8px;
        border: 1px solid var(--db-border-color, #333);

        p {
          margin: 0 0 8px 0;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .action-btn {
            text-align: left;
            padding: 6px 10px;
            background-color: var(--db-editor-color-canvas-bg, #333);
            border: 1px solid var(--db-border-color, #444);
            color: var(--theme-color-text);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;

            &:hover:not(.disabled) {
              background-color: var(--db-color-button-primary-bg, #1890ff);
              color: white;
              border-color: var(--db-color-button-primary-bg, #1890ff);
            }

            &.disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }

  .input-area {
    padding: 12px;
    border-top: 1px solid var(--db-border-color, #333);
    background-color: var(--db-editor-color-panel-bg);
    display: flex;
    flex-direction: column;
    gap: 8px;

    textarea {
      width: 100%;
      height: 60px;
      background-color: var(--db-color-input-background, #1f1f1f);
      border: 1px solid var(--db-border-color, #333);
      color: var(--theme-color-text);
      border-radius: 4px;
      padding: 8px;
      resize: none;
      font-family: inherit;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: var(--db-color-button-primary-bg, #1890ff);
      }
    }

    .send-btn {
      align-self: flex-end;
      padding: 4px 12px;
      background-color: var(--db-color-button-primary-bg, #1890ff);
      color: white;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 12px;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
