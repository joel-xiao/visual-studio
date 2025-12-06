import http from '../http';

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'code' | 'action';
  actions?: { label: string; value: string; disabled?: boolean }[];
}

export interface IAIResponse {
  reply: string;
  code?: string;
  type?: 'text' | 'code' | 'action';
  actions?: { label: string; value: string; disabled?: boolean }[];
}

// Mock data for Scene 1
const scene1BaseData = {
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

const scene1EnhancedData = JSON.parse(JSON.stringify(scene1BaseData));
if (scene1EnhancedData.nodes && scene1EnhancedData.nodes.length > 0) {
  scene1EnhancedData.nodes[0].props.code = {
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

export const aiApi = {
  /**
   * Send a chat message to the AI
   */
  chat(messages: IAIMessage[], scene?: string) {
    // In a real scenario, this would be:
    // return http.post<IAIResponse>('/ai/chat', { messages, scene });

    // Mock response for now
    return new Promise<IAIResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          reply: '收到您的请求。正在处理...',
          actions: []
        });
      }, 1000);
    });
  },

  /**
   * Generate code based on a specific scene and params
   */
  generate(scene: string, params: any) {
    // return http.post<any>('/ai/generate', { scene, params });

    // Mock response for Scene 1
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        if (scene === 'scene1') {
          resolve(scene1EnhancedData);
        } else {
          reject('Unknown scene');
        }
      }, 2000);
    });
  }
};
