import { ref, reactive, computed, toRefs, type Ref } from 'vue';

export type ViewMode = 'home' | 'http-editor' | 'wizard-editor' | 'mall';

export interface IDataCenterState {
    viewMode: ViewMode;
    editingSource: any;
    dataSourceList: any[];
    currentResponse: any;
}

let _state: IDataCenterState | null = null;

const MOCK_DATA = [
    {
        id: 'ds_001',
        name: '用户基本信息查询',
        type: 'api',
        method: 'GET',
        url: 'https://api.example.com/v1/user/profile',
        steps: [
            {
                id: 'main',
                name: '获取属性',
                method: 'GET',
                url: 'https://api.example.com/v1/user/profile',
                headers: [{ key: 'Authorization', value: 'Bearer {{token}}', enabled: true }],
                bodyMode: 'none',
                bodyParams: [],
                condition: ''
            }
        ],
        transformation: {
            script: 'return results.main.data',
            type: 'raw'
        }
    },
    {
        id: 'ds_002',
        name: '时序监控数据',
        type: 'api',
        method: 'POST',
        url: 'https://monitor.server.com/api/query',
        steps: [
            {
                id: 'get_metrics',
                name: '拉取点位',
                method: 'POST',
                url: 'https://monitor.server.com/api/query',
                headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
                bodyMode: 'raw',
                bodyParams: [{ key: 'query', value: 'SELECT * FROM cpu_usage', enabled: true }],
                condition: ''
            }
        ],
        transformation: {
            script: 'return results.get_metrics.data.map(i => ({ x: i.time, y: i.value }))',
            type: 'timeseries'
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
