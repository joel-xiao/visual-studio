const schema: IComponentSchemaExport = {
  name: '基础柱状图',
  type: 'APACHE_ECHARTS_BAR_SIMPLE',
  icon: 'materials/apache-e-charts/bar-simple.png',
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
  ],

  categorySchemas: [
    {
      name: '图表',
      icon: '',
      category: 'CHART',
      schemas: [
        {
          type: 'schema',
          schema: 'ECHARTS_BAR',
          label: '',
          key: 'series.0',
          default: {
            barWidth: 50,
            barCategoryGap: 100,
            itemStyle: {
              color: '#3662EC',
              borderRadius: [0, 0, 0, 0],
              borderColor: '#3662EC',
              borderWidth: 0,
              borderType: 'solid',
              shadowColor: '#00000033',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0
            },
            backgroundStyle: {
              color: '#B4B4B41A'
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
              schema: 'ECHARTS_BAR'
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
