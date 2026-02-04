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
    }
  ],
  categorySchemas: [
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
    }
  ]
};
export default schema;
