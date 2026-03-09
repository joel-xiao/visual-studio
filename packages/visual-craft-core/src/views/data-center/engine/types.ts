export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Single request step in a chain
 */
export interface IRequestStep {
    id: string;
    name: string;
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    bodyMode?: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'json';
    body?: any;
    auth?: {
        type: 'none' | 'bearer' | 'basic' | 'apikey' | 'inherit';
        config: Record<string, any>;
    };
    enable?: boolean;

    /**
     * Logic for cascading: 
     * - `dependsOn`: IDs of steps that must complete before this one.
     * - `condition`: JS expression or func (string if handled by backend/sandbox) to decide if this step runs.
     */
    dependsOn?: string[];
    condition?: string;

    /**
     * Data transformation:
     * - `transformResponse`: JS string/func to process raw response.
     * - `cacheKey`: Where to save the result for downstream steps (e.g. 'auth.token').
     */
    transformResponse?: string;
    cacheKey?: string;

    retryCount?: number;
}

/**
 * Full data source configuration
 */
export interface IDataSourceConfig {
    id?: string;
    name: string;
    type: string; // 'api' | 'mqtt' | 'sql' | 'huawei' etc.
    baseUrl?: string;
    globalHeaders?: Record<string, string>;
    steps: IRequestStep[];
}

export interface IDataSourceLegacy extends IDataSourceConfig {
    connectorType: 'generic' | 'huawei_esight' | 'zabbix' | 'sql_database';
    connectorConfig?: any;
}
