const FontFamilyOptions = [{ label: '宋体', value: 'SimSun' }];

const FontSizeOptions = [
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '22', value: 22 },
  { label: '24', value: 24 },
  { label: '26', value: 26 },
  { label: '28', value: 28 },
  { label: '30', value: 30 },
  { label: '32', value: 32 }
];

const BlendModeOptions = [
  { label: '穿透', value: 'pass-through' },
  { label: '正常', value: 'normal', splitLine: true },
  { label: '变暗', value: 'darken' },
  { label: '正片叠底', value: 'multiply' },
  { label: '颜色加深', value: 'color-burn' },
  { label: '加暗', value: 'linear-burn' },
  { label: '变亮', value: 'lighten' },
  { label: '滤色', value: 'screen' },
  { label: '颜色减淡', value: 'color-dodge' },
  { label: '提亮', value: 'linear-dodge', splitLine: true },
  { label: '叠加', value: 'overlay' },
  { label: '柔光', value: 'soft-light' },
  { label: '强光', value: 'hard-light', splitLine: true },
  { label: '差集', value: 'difference' },
  { label: '排除', value: 'exclusion', splitLine: true },
  { label: '色相', value: 'hue' },
  { label: '饱和度', value: 'saturation' },
  { label: '颜色', value: 'color' },
  { label: '明度', value: 'luminosity' }
];

const TextAlignOptions = [
  { value: 'left', icon: 'mdi:format-align-left', tooltip: '左对齐' },
  { value: 'center', icon: 'mdi:format-align-center', tooltip: '居中对齐' },
  { value: 'right', icon: 'mdi:format-align-right', tooltip: '右对齐' },
  { value: 'justify', icon: 'mdi:format-align-justify', tooltip: '两端对齐' }
];

const TextStyleOptions = [
  { value: 'bold', icon: 'mdi:format-bold', tooltip: '加粗' },
  { value: 'italic', icon: 'mdi:format-italic', tooltip: '斜体' },
  { value: 'underline', icon: 'mdi:format-underline', tooltip: '下划线' },
  { value: 'line-through', icon: 'mdi:format-strikethrough', tooltip: '删除线' }
];

const CodeLanguageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Markdown', value: 'markdown' }
];

const MarkerOptions = [
  { label: '圆形', value: 'circle', icon: 'mdi:circle' },
  { label: '三角形', value: 'triangle', icon: 'mdi:triangle' },
  { label: '矩形', value: 'rect', icon: 'mdi:rectangle' },
  { label: '圆角矩形', value: 'roundRect', icon: 'mdi:rectangle-rounded-corner' },
  { label: '大头针', value: 'pin', icon: 'mdi:map-marker' },
  { label: '菱形', value: 'diamond', icon: 'mdi:diamond-outline' }
];

export default {
  FontFamilyOptions,
  FontSizeOptions,
  BlendModeOptions,
  TextAlignOptions,
  TextStyleOptions,
  CodeLanguageOptions,
  MarkerOptions
};
