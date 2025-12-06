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

export default {
  FontFamilyOptions,
  FontSizeOptions,
  BlendModeOptions
};
