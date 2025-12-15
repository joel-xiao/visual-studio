export interface IPromptSuggestion {
    label: string;
    value: string;
    icon?: string;
    agent?: string;
    color?: string; // 颜色配置，格式：'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan'
}

export function getPromptSuggestions(
    context: {
        hasSelection: boolean;
        selectionType?: string;
        nodeCount: number;
    }
): IPromptSuggestion[] {
    const { hasSelection, selectionType, nodeCount } = context;

    // Scenario 1: Empty Canvas or Root Selection
    if (nodeCount === 0 || (!hasSelection && nodeCount > 0)) {
        return [
            { label: '生成销售大屏', value: '帮我生成一个销售监控大屏，包含KPI卡片和折线图', icon: 'mdi:view-dashboard-outline', agent: 'layout-architect', color: 'blue' },
            { label: '生成科技感布局', value: '生成一个深色科技感风格的布局，左侧导航，中间地图，右侧图表', icon: 'mdi:view-dashboard-outline', agent: 'layout-architect', color: 'purple' },
            { label: '切换暗黑主题', value: '切换到暗黑金主题', icon: 'mdi:palette', agent: 'theme-engine', color: 'orange' }
        ];
    }

    // Scenario 2: Component Selected (Chart)
    if (hasSelection && selectionType?.toUpperCase().includes('APACHE_ECHARTS')) {
        return [
            { label: '换成折线图', value: '把这个图表换成折线图', icon: 'mdi:chart-line', agent: 'chart-creator', color: 'blue' },
            { label: '变成红色', value: '把图表主体颜色改成红色', icon: 'mdi:palette-outline', agent: 'chart-creator', color: 'pink' },
            { label: '增加标题', value: '给图表加上标题"季度销售额"', icon: 'mdi:format-title', agent: 'chart-creator', color: 'green' },
            { label: '生成模拟数据', value: '帮我生成一些逼真的模拟数据', icon: 'mdi:database-refresh', agent: 'data-analyst', color: 'cyan' }
        ];
    }

    // Scenario 3: Component Selected (General/Unknown)
    if (hasSelection) {
        return [
            { label: '向左移动', value: '把这个组件向左移动 50px', icon: 'mdi:arrow-left', agent: 'layout-architect', color: 'blue' },
            { label: '放大一点', value: '把组件宽度增加 20%', icon: 'mdi:arrow-expand-all', agent: 'layout-architect', color: 'green' }
        ];
    }

    // Default fallback
    return [
        { label: '优化布局', value: '帮我优化一下当前的布局排版', icon: 'mdi:view-compact-outline', agent: 'layout-architect', color: 'purple' },
        { label: '分析数据', value: '分析当前大屏的数据展示逻辑', icon: 'mdi:lightbulb-on-outline', agent: 'data-analyst', color: 'cyan' }
    ];
}
