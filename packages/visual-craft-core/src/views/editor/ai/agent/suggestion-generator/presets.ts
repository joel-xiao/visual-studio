export interface IPromptSuggestion {
  label: string;
  value: string;
  icon?: string;
  agent?: string;
  color?: string;
}

// 预设建议 - 丰富的场景覆盖
export function getPresetSuggestions(context: {
  hasSelection: boolean;
  selectionType?: string;
  nodeCount: number;
}): IPromptSuggestion[] {
  const { hasSelection, selectionType, nodeCount } = context;

  // 空画布场景 - 提供多种大屏模板和基础组件
  if (nodeCount === 0) {
    return [
      // 大屏模板建议
      { label: '生成销售大屏', value: '帮我生成一个销售监控大屏，包含KPI卡片和折线图', icon: 'mdi:view-dashboard-outline', agent: 'layout-architect', color: '#409eff' },
      { label: '生成科技感布局', value: '生成一个深色科技感风格的布局，左侧导航，中间地图，右侧图表', icon: 'mdi:view-dashboard-outline', agent: 'layout-architect', color: '#9093ff' },
      { label: '创建运营大屏', value: '创建一个运营数据大屏，包含用户活跃度、留存率、增长趋势等数据', icon: 'mdi:account-group', agent: 'layout-architect', color: '#67c23a' },
      { label: '创建监控大屏', value: '创建一个系统监控大屏，显示服务器状态、性能指标、告警信息', icon: 'mdi:monitor-dashboard', agent: 'layout-architect', color: '#e6a23c' },

      // 基础图表建议
      { label: '添加柱状图', value: '在画布中添加一个柱状图', icon: 'mdi:chart-bar', agent: 'chart-creator', color: '#409eff' },
      { label: '添加折线图', value: '创建一个折线图显示趋势数据', icon: 'mdi:chart-line', agent: 'chart-creator', color: '#67c23a' },
      { label: '添加饼图', value: '插入一个饼图展示占比数据', icon: 'mdi:chart-pie', agent: 'chart-creator', color: '#f56c6c' },
      { label: '添加面积图', value: '创建一个面积图显示数据变化', icon: 'mdi:chart-areaspline', agent: 'chart-creator', color: '#40c9ff' },

      // 主题和样式建议
      { label: '切换暗黑主题', value: '切换到暗黑金主题', icon: 'mdi:palette', agent: 'theme-engine', color: '#e6a23c' },
      { label: '应用蓝色主题', value: '应用科技蓝主题风格', icon: 'mdi:palette-outline', agent: 'theme-engine', color: '#409eff' }
    ];
  }

  // 有内容但无选中 - 提供整体优化和扩展建议
  if (!hasSelection && nodeCount > 0) {
    return [
      // 布局优化建议
      { label: '优化布局', value: '帮我优化一下当前的布局排版', icon: 'mdi:view-compact-outline', agent: 'layout-architect', color: '#9093ff' },
      { label: '自动对齐组件', value: '自动对齐和分布当前画布上的所有组件', icon: 'mdi:format-align-center', agent: 'layout-architect', color: '#409eff' },
      { label: '调整间距', value: '优化组件之间的间距和留白', icon: 'mdi:resize', agent: 'layout-architect', color: '#67c23a' },

      // 新增组件建议
      { label: '添加新图表', value: '在合适的位置添加一个新的图表组件', icon: 'mdi:plus-circle', agent: 'chart-creator', color: '#67c23a' },
      { label: '添加标题区域', value: '在顶部添加大屏标题和时间显示', icon: 'mdi:format-title', agent: 'layout-architect', color: '#e6a23c' },
      { label: '添加KPI卡片', value: '添加一组KPI指标卡片', icon: 'mdi:card-outline', agent: 'chart-creator', color: '#409eff' },

      // 主题和数据建议
      { label: '切换主题风格', value: '切换到深色科技风主题', icon: 'mdi:palette', agent: 'theme-engine', color: '#9093ff' },
      { label: '分析数据', value: '分析当前大屏的数据展示逻辑', icon: 'mdi:lightbulb-on-outline', agent: 'data-analyst', color: '#40c9ff' },
      { label: '生成全局数据', value: '为所有图表生成统一的模拟数据', icon: 'mdi:database-refresh', agent: 'data-analyst', color: '#40c9ff' }
    ];
  }

  // 选中图表组件 - 提供图表相关的所有操作
  if (hasSelection && selectionType?.toUpperCase().includes('APACHE_ECHARTS')) {
    return [
      // 图表类型切换
      { label: '换成折线图', value: '把这个图表换成折线图', icon: 'mdi:chart-line', agent: 'chart-creator', color: '#409eff' },
      { label: '换成柱状图', value: '把这个图表换成柱状图', icon: 'mdi:chart-bar', agent: 'chart-creator', color: '#67c23a' },
      { label: '换成饼图', value: '把这个图表换成饼图', icon: 'mdi:chart-pie', agent: 'chart-creator', color: '#f56c6c' },
      { label: '换成面积图', value: '把这个图表换成面积图', icon: 'mdi:chart-areaspline', agent: 'chart-creator', color: '#40c9ff' },

      // 样式调整
      { label: '变成红色', value: '把图表主体颜色改成红色', icon: 'mdi:palette-outline', agent: 'chart-creator', color: '#f56c6c' },
      { label: '变成蓝色渐变', value: '把图表改为蓝色渐变效果', icon: 'mdi:gradient', agent: 'chart-creator', color: '#409eff' },
      { label: '增加标题', value: '给图表加上标题"季度销售额"', icon: 'mdi:format-title', agent: 'chart-creator', color: '#67c23a' },
      { label: '显示图例', value: '为图表添加图例说明', icon: 'mdi:format-list-bulleted', agent: 'chart-creator', color: '#e6a23c' },

      // 数据相关
      { label: '生成模拟数据', value: '帮我生成一些逼真的模拟数据', icon: 'mdi:database-refresh', agent: 'data-analyst', color: '#40c9ff' },
      { label: '增加数据点', value: '为图表增加更多数据点', icon: 'mdi:plus-circle-outline', agent: 'data-analyst', color: '#67c23a' }
    ];
  }

  // 选中其他组件 - 提供通用组件操作
  if (hasSelection) {
    return [
      // 位置调整
      { label: '向左移动', value: '把这个组件向左移动 50px', icon: 'mdi:arrow-left', agent: 'layout-architect', color: '#409eff' },
      { label: '向右移动', value: '把这个组件向右移动 50px', icon: 'mdi:arrow-right', agent: 'layout-architect', color: '#409eff' },
      { label: '向上移动', value: '把这个组件向上移动 30px', icon: 'mdi:arrow-up', agent: 'layout-architect', color: '#67c23a' },
      { label: '向下移动', value: '把这个组件向下移动 30px', icon: 'mdi:arrow-down', agent: 'layout-architect', color: '#67c23a' },

      // 尺寸调整
      { label: '放大一点', value: '把组件宽度增加 20%', icon: 'mdi:arrow-expand-all', agent: 'layout-architect', color: '#67c23a' },
      { label: '缩小一点', value: '把组件尺寸缩小 15%', icon: 'mdi:arrow-collapse-all', agent: 'layout-architect', color: '#e6a23c' },
      { label: '调整为正方形', value: '把组件调整为正方形比例', icon: 'mdi:square-outline', agent: 'layout-architect', color: '#9093ff' },

      // 组件操作
      { label: '复制组件', value: '复制当前组件到右侧', icon: 'mdi:content-copy', agent: 'layout-architect', color: '#e6a23c' },
      { label: '删除组件', value: '删除当前选中的组件', icon: 'mdi:delete', agent: 'layout-architect', color: '#f56c6c' },
      { label: '置于顶层', value: '把组件移到最上层显示', icon: 'mdi:bring-to-front', agent: 'layout-architect', color: '#40c9ff' }
    ];
  }

  return [];
}
