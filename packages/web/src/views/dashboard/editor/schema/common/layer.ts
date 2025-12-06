import options from '../compossible/options';

const SCHEMA_NAME = 'COMMON_LAYER';
const SCHEMA_LABEL = '图层';
const SCHEMA_KEY = 'layer';

const schema: ISchemaExport = {
  name: SCHEMA_NAME,
  label: SCHEMA_LABEL,
  key: SCHEMA_KEY,
  schema: [
    [
      {
        key: 'blends',
        type: Array,
        default: [{
          mix: 'normal',
          opacity: 100,
          visible: true
        }],
        ctrl: 'BLENDS',
        options: options.BlendModeOptions
      }
    ]
  ]
};
export default schema;
