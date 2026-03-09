export interface IDataSourceStep {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: { key: string; value: string; enabled: boolean }[];
    autoAuth?: boolean;
    bodyMode: string;
    bodyParams: { key: string; value: string; enabled: boolean }[];
    condition?: string; // JS expression, e.g., "results.auth.success"
}

export interface IDataTransformation {
    script: string; // JS code for final transformation
    type: 'array' | 'timeseries' | 'summary' | 'raw';
}

export interface IDataSource {
    id: string;
    name: string;
    type: string;
    method?: string; // For simple API
    url?: string;    // For simple API
    steps: IDataSourceStep[];
    transformation?: IDataTransformation;
    status: 'online' | 'offline' | 'error';
    updatedAt: string;
    categoryId: string;
}

export interface IFieldMapping {
    field: string;
    mapping: string;
    status: 'success' | 'error' | 'warning';
}

export interface IBindingConfig {
    sourceId?: string;
    autoUpdate: boolean;
    interval: number;
    mappings: IFieldMapping[];
    filterScript?: string;
    staticData?: string;
}
