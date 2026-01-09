const schema: IComponentSchemaExport = {
  name: '成组容器',
  type: 'GROUP',
  icon: 'materials/group.png',
  schemas: [
    {
      type: 'schema',
      schema: 'COMMON_LAYOUT',
      default: {
        x: 0,
        y: 0,
        width: 300,
        height: 200,
        rotate: 0,
        radius: [0, 0, 0, 0]
      }
    }
  ]
};
export default schema;
