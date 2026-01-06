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
