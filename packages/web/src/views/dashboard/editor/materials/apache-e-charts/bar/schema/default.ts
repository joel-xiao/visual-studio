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
    {
      type: 'schema',
      schema: 'COMMON_CODE_EDITOR',
      default: {
        value: ''
      }
    }
  ],

  categorySchemas: [
    {
      name: '标题',
      icon: '',
      category: 'TITLE',

      schemas: [
        {
          type: 'schema',
          schema: 'COMMON_TEXT',
          label: '标题',
          key: 'title',
          default: {
            value: '这是标题'
          }
        },
        {
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

      schemas: []
    }
  ]
};
export default schema;
