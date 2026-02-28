const schema: IComponentSchemaExport = {
  name: '基础 K 线图',
  type: 'APACHE_ECHARTS_CANDLESTICK_SIMPLE',
  icon: 'materials/apache-e-charts/candlestick-simple.png',
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
        blends: [{
          mix: 'normal',
          opacity: 1,
          visible: true
        }]
      }
    },
    {
      type: 'schema',
      schema: 'COMMON_COLOR_SCHEME',
      default: {
        theme: 'dark'
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
          schema: 'ECHARTS_CANDLESTICK',
          label: '',
          key: 'series.0',
          default: {
            barWidth: 30,
            itemStyle: {
              color: '#DE3B45',
              color0: '#44A647',
              borderColor: '#DE3B45',
              borderColor0: '#44A647',
              borderWidth: 1,
              shadowColor: '#00000000',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0,
              opacity: 1
            },
            dataZoom: {
              show: true,
              start: 0,
              end: 100,
              lock: false
            }
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
      schemas: [],
      schemasTabs: [
        {
          name: 'X轴',
          tab: 'xAxis',
          schemas: [
            {
              type: 'schema',
              schema: 'ECHARTS_AXIS',
              label: '',
              key: 'xAxis',
              default: {
                axisLabel: {
                  fontFamily: 'Microsoft YaHei',
                  fontSize: 12,
                  color: '#fff',
                  styles: [],
                  backgroundColor: '#fff',
                  padding: { h: 0, v: 0 }
                },
                splitNumber: 5,
                axisLine: {
                  show: true,
                  color: '#fff',
                  width: 1,
                  type: 'solid'
                },
                axisTick: {
                  show: true,
                  color: '#fff',
                  width: 1,
                  type: 'solid',
                  length: 5
                },
                splitLine: {
                  show: false,
                  color: '#fff',
                  width: 1,
                  type: 'solid'
                }
              }
            }
          ]
        },
        {
          name: 'Y轴',
          tab: 'yAxis',
          schemas: [
            {
              type: 'schema',
              schema: 'ECHARTS_AXIS',
              label: '',
              key: 'yAxis',
              default: {
                axisLabel: {
                  fontFamily: 'Microsoft YaHei',
                  fontSize: 12,
                  color: '#fff',
                  styles: [],
                  backgroundColor: '#fff',
                  padding: { h: 0, v: 0 }
                },
                splitNumber: 5,
                axisLine: {
                  show: true,
                  color: '#fff',
                  width: 1,
                  type: 'solid'
                },
                axisTick: {
                  show: true,
                  color: '#fff',
                  width: 1,
                  type: 'solid',
                  length: 5
                },
                splitLine: {
                  show: true,
                  color: '#fff',
                  width: 1,
                  type: 'dashed'
                }
              }
            }
          ]
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
              schema: 'ECHARTS_CANDLESTICK'
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
