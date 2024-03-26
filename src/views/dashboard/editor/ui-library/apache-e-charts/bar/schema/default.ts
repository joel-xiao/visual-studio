const schema: IComponentSchemaExport = {
  name: '基础柱状图',
  type: 'APACHE_ECHARTS_BAR_SIMPLE',
  icon: 'ui-library/apache-e-charts/bar-simple.png',
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
  ],

  categorySchemas: [
    // {
    //   name: '图表',
    //   icon: '',
    //   category: 'CHART',
      
    //   schemas: [
    //     {
    //       type: 'schema',
    //       schema: 'COMMON_LAYOUT',
    //       default: {
    //         x: 0,
    //         y: 0,
    //         width: 300,
    //         height: 300,
    //         rotate: 0,
    //         radius: [0, 0, 0, 0]
    //       }
    //     }
    //   ],
    // },
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
        }
      ],
    },
    {
      name: '图例',
      icon: '',
      category: 'LEGEND',
      
      schemas: [],
    }
  ]
};
export default schema;
