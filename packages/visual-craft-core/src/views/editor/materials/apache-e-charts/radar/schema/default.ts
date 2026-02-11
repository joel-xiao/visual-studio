const schema: IComponentSchemaExport = {
  name: '基础雷达图',
  type: 'APACHE_ECHARTS_RADAR_SIMPLE',
  icon: 'materials/apache-e-charts/radar-simple.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      default: {
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    },
    {
      type: 'schema',
      schema: 'COMMON_LAYER',
      default: {
        blends: [
          {
            mix: 'normal',
            opacity: 1,
            visible: true
          }
        ]
      }
    }
  ],
  categorySchemas: [
    {
      name: '图表',
      icon: '',
      category: 'CHART',
      schemas: [
        {
          type: 'schema',
          schema: 'ECHARTS_RADAR',
          label: '',
          key: '',
          default: {
            radar: {
              shape: 'polygon',
              radius: 80,
              fixMax: false,
              indicatorMax: 100
            },
            series: [
              {
                lineStyle: {
                  width: 2,
                  type: 'solid',
                  shadowColor: '#00000000',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  shadowBlur: 0
                },
                areaStyle: {
                  show: false,
                  opacity: 0.4
                },
                showSymbol: true,
                itemStyle: {
                  color: '#2362E4'
                },
                label: {
                  show: false,
                  fontFamily: 'SimSun',
                  fontSize: 12,
                  color: '#fff',
                  styles: [],
                  position: 'top'
                }
              }
            ]
          }
        }
      ]
    },
    {
      name: '标题',
      icon: '',
      category: 'TITLE',
      schemas: [
        {
          show_switch: true,
          type: 'schema',
          schema: 'COMMON_TEXT',
          label: '标题',
          key: 'title',
          default: {
            value: '这是标题'
          }
        },
        {
          show_switch: true,
          type: 'schema',
          schema: 'COMMON_TEXT',
          label: '副标题',
          key: 'subtitle',
          default: {
            value: '这是副标题'
          }
        }
      ]
    },
    {
      name: '图例',
      icon: '',
      category: 'LEGEND',
      schemas: [
        {
          show_switch: true,
          type: 'schema',
          schema: 'ECHARTS_LEGEND',
          label: '图例设置',
          key: 'legend',
          default: {
            textStyle: {
              fontFamily: 'SimSun',
              fontSize: 12,
              color: '#fff',
              styles: []
            },
            position: 'top-center',
            icon: 'circle',
            itemWidth: 14,
            itemGap: 10
          }
        }
      ]
    },
    {
      name: '坐标轴',
      icon: '',
      category: 'AXIS',
      schemas: [
        {
          type: 'schema',
          schema: 'ECHARTS_RADAR_AXIS',
          label: '',
          key: 'radar',
          default: {
            splitLine: {
              show: true,
              lineStyle: {
                color: '#E0E6F1',
                width: 1,
                type: 'solid'
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#E0E6F1',
                width: 1,
                type: 'solid'
              }
            },
            axisName: {
              show: true,
              fontFamily: 'Microsoft YaHei',
              fontSize: 12,
              color: '#fff',
              styles: []
            },
            nameGap: 15,
            axisTick: {
              show: true,
              length: 5,
              lineStyle: {
                color: '#E0E6F1',
                width: 1,
                type: 'solid'
              }
            },
            axisLabel: {
              show: true,
              fontFamily: 'Microsoft YaHei',
              fontSize: 12,
              color: '#fff',
              styles: [],
              margin: 8
            },
            splitNumber: 5
          }
        }
      ]
    },
    {
      name: '提示框',
      icon: '',
      category: 'TOOLTIP',
      schemas: [
        {
          show_switch: true,
          type: 'schema',
          schema: 'ECHARTS_TOOLTIP',
          key: 'tooltip',
          default: {
            textStyle: {
              fontFamily: 'SimSun',
              fontSize: 12,
              color: '#fff',
              styles: []
            },
            padding: [10, 10],
            borderColor: '#000000A6',
            backgroundColor: '#000000A6'
          }
        }
      ]
    },
    {
      name: '条件',
      icon: '',
      category: 'CONDITIONS',
      schemas: [
        {
          type: 'schema',
          schema: 'CONDITIONS',
          key: 'conditions',
          schemas: [
            {
              type: 'conditionsSchema',
              schema: 'ECHARTS_RADAR'
            }
          ]
        }
      ]
    },
    {
      name: '自定义',
      icon: '',
      category: 'CODE',
      schemas: [
        {
          type: 'schema',
          schema: 'COMMON_CODE_EDITOR',
          default: {
            options: ''
          }
        }
      ]
    }
  ]
};
export default schema;
