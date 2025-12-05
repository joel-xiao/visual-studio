const schema: IComponentSchemaExport = {
  name: '根容器',
  type: 'CANVAS_ROOT',
  icon: 'qw.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_CANVAS_LAYOUT',
      default: {
        width: 1000,
        height: 600
      }
    },

    {
      type: 'schema',
      schema: 'COMMON_CANVAS_FILL',
      default: {
        color: ''
      }
    }
  ]
};
export default schema;
