const schema: IComponentSchemaExport = {
  name: '基础饼图',
  type: 'APACHE_ECHARTS_PIE_SIMPLE',
  icon: 'materials/apache-e-charts/pie-simple.png',
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
          schema: 'ECHARTS_PIE',
          label: '',
          key: 'series.0',
          default: {
            radius: [0, 80],
            padAngle: 0,
            startAngle: 90,
            itemStyle: {
              color: '#3662EC',
              borderRadiusIsSeparate: false,
              borderRadius: 0,
              borderColor: '#3662EC',
              borderWidth: 0,
              borderType: 'solid'
            },
            label: {
              show: false,
              type: 'percent',
              precision: 2,
              fontFamily: 'SimSun',
              fontSize: 12,
              color: '#fff',
              styles: [],
              position: 'outside'
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
              schema: 'ECHARTS_PIE'
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
