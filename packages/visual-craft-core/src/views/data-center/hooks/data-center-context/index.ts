import { ref, reactive, computed, toRefs, type Ref } from 'vue';

export type ViewMode = 'home' | 'http-editor' | 'sql-editor' | 'mqtt-editor' | 'wizard-editor' | 'mall';

export interface IDataCenterState {
    viewMode: ViewMode;
    editingSource: any;
    dataSourceList: any[];
    currentResponse: any;
}

let _state: IDataCenterState | null = null;

const MOCK_DATA = [
    {
        id: 'ds_user_ctx',
        name: '① [基础] 获取用户业务上下文',
        type: 'api',
        method: 'GET',
        url: 'https://api.erp.com/user/context',
        variables: [
            { key: 'uid', value: 'admin_001', description: '操作员ID', enabled: true }
        ],
        steps: [{
            id: 'ctx',
            name: '拉取上下文',
            method: 'GET',
            url: 'https://api.erp.com/user/context?uid={{inputs.uid}}',
            condition: ''
        }],
        transformation: { script: 'return { orgId: data.org_id, region: data.pref_region, role: data.access_level };', type: 'script' }
    },
    {
        id: 'ds_sales_stats',
        name: '② [业务] 销售业绩明细',
        type: 'api',
        method: 'POST',
        url: 'https://api.erp.com/sales/stats',
        variables: [
            { key: 'orgId', value: '', description: '组织机构ID', enabled: true },
            { key: 'period', value: '2024-Q1', description: '统计周期', enabled: true }
        ],
        steps: [{
            id: 'stats',
            name: '执行查询',
            method: 'POST',
            url: 'https://api.erp.com/sales/stats',
            bodyMode: 'json',
            body: '{\n  "org_id": "{{inputs.orgId}}",\n  "time_range": "{{inputs.period}}"\n}',
            condition: ''
        }],
        transformation: { script: 'return data.list.map(i => ({ pid: i.product_id, amount: i.total_price }));', type: 'script' }
    },
    {
        id: 'ds_stock_status',
        name: '② [业务] 实时库存查询',
        type: 'api',
        method: 'GET',
        url: 'https://api.erp.com/stock/list',
        variables: [
            { key: 'region', value: '', description: '仓库所在区域', enabled: true }
        ],
        steps: [{
            id: 'stock',
            name: '查询库存',
            method: 'GET',
            url: 'https://api.erp.com/stock/list?area={{inputs.region}}',
            condition: ''
        }],
        transformation: { script: 'return data.items.reduce((acc, curr) => ({ ...acc, [curr.product_id]: curr.count }), {});', type: 'script' }
    },
    {
        id: 'ds_complex_orch',
        name: '③ [极致示例] 跨模块数据聚合看板',
        type: 'api',
        method: 'POST',
        url: 'composite-dashboard',
        steps: [
            {
                id: 'step1_auth',
                name: '1. 验证并获取权限范围',
                type: 'reference',
                refId: 'ds_user_ctx',
                variables: [{ key: 'uid', value: 'current_user', enabled: true }]
            },
            {
                id: 'step2_sales',
                name: '2. 异步拉取销售额 (依赖步骤1)',
                type: 'reference',
                refId: 'ds_sales_stats',
                condition: 'results.step1_auth.role === "admin"',
                variables: [
                    { key: 'orgId', value: '{{results.step1_auth.orgId}}', enabled: true },
                    { key: 'period', value: '2024-Q2', enabled: true }
                ]
            },
            {
                id: 'step3_stock',
                name: '3. 并行拉取库存状态 (依赖步骤1)',
                type: 'reference',
                refId: 'ds_stock_status',
                variables: [
                    { key: 'region', value: '{{results.step1_auth.region}}', enabled: true }
                ]
            }
        ],
        transformation: {
            script: `// 复杂场景：数据深度合并
const salesList = results.step2_sales || [];
const stockMap = results.step3_stock || {};

// 将销售额与库存按产品ID对齐合并
return salesList.map(item => ({
  productId: item.pid,
  salesAmount: item.amount,
  stockLevel: stockMap[item.pid] || 0,
  isAlert: (stockMap[item.pid] || 0) < 10 && item.amount > 1000, // 销量高但库存预警
  updatedAt: new Date().toISOString()
}));`,
            type: 'script'
        }
    }
];

function ensureState(): IDataCenterState {
    if (!_state) {
        _state = reactive({
            viewMode: 'home' as ViewMode,
            editingSource: null,
            dataSourceList: [...MOCK_DATA],
            currentResponse: null,
        });
    }
    return _state!;
}

export function useDataCenterContext() {
    const state = ensureState();

    const setViewMode = (mode: ViewMode) => {
        state.viewMode = mode;
    };

    const setEditingSource = (source: any) => {
        state.editingSource = source;
    };

    const setDataSourceList = (list: any[]) => {
        state.dataSourceList = list;
    };

    const setCurrentResponse = (response: any) => {
        state.currentResponse = response;
    };

    const addDataSource = (source: any) => {
        const newSource = {
            ...source,
            id: 'ds_' + Math.random().toString(36).substr(2, 9)
        };
        state.dataSourceList.push(newSource);
        return newSource;
    };

    const updateDataSource = (source: any) => {
        const index = state.dataSourceList.findIndex(item => item.id === source.id);
        if (index !== -1) {
            state.dataSourceList[index] = { ...source };
        }
    };

    const deleteDataSource = (id: string) => {
        const index = state.dataSourceList.findIndex(item => item.id === id);
        if (index !== -1) {
            state.dataSourceList.splice(index, 1);
        }
    };

    return {
        state,
        ...toRefs(state),
        setViewMode,
        setEditingSource,
        setDataSourceList,
        setCurrentResponse,
        addDataSource,
        updateDataSource,
        deleteDataSource,
    };
}

export function removeDataCenterContext() {
    _state = null;
}
