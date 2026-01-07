export const FontFamilyOptions = [
    { label: '微软雅黑', value: 'Microsoft YaHei' },
    { label: '宋体', value: 'SimSun' },
    { label: '黑体', value: 'SimHei' },
    { label: 'PingFang SC', value: 'PingFang SC' },
    { label: 'Arial', value: 'Arial' }
];

export const FontSizeOptions = [
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
    { label: '32', value: 32 },
    { label: '36', value: 36 },
    { label: '48', value: 48 },
    { label: '64', value: 64 },
    { label: '72', value: 72 }
];

export const TextAlignOptions = [
    { value: 'left', icon: 'mdi:format-align-left', hint: '左对齐' },
    { value: 'center', icon: 'mdi:format-align-center', hint: '居中对齐' },
    { value: 'right', icon: 'mdi:format-align-right', hint: '右对齐' },
    { value: 'justify', icon: 'mdi:format-align-justify', hint: '两端对齐' }
];

export const TextStyleOptions = [
    { value: 'bold', icon: 'mdi:format-bold', hint: '加粗' },
    { value: 'italic', icon: 'mdi:format-italic', hint: '斜体' },
    { value: 'underline', icon: 'mdi:format-underline', hint: '下划线' },
    { value: 'line-through', icon: 'mdi:format-strikethrough', hint: '删除线' }
];

export default {
    FontFamilyOptions,
    FontSizeOptions,
    TextAlignOptions,
    TextStyleOptions
};
