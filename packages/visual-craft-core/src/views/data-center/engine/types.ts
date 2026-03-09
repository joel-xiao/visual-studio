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
     * - `transformation`: Structured JS processing configuration.
     * - `transformResponse`: (Legacy) JS string/func to process raw response.
     * - `cacheKey`: Where to save the result for downstream steps (e.g. 'auth.token').
     */
    transformation?: {
        type: string;
        script: string;
    };
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

    // Global properties that can be inherited
    globalAuth?: {
        type: 'none' | 'bearer' | 'basic' | 'apikey';
        config: Record<string, any>;
    };
    globalHeaders?: Array<{ key: string; value: string; enabled: boolean }>;

    // Shared state/variables across the whole flow
    variables?: Array<{ key: string; value: any; description?: string }>;

    steps: IRequestStep[];
    transformation?: {
        type: string;
        script: string;
    };
}

export interface IDataSourceLegacy extends IDataSourceConfig {
    connectorType: 'generic' | 'huawei_esight' | 'zabbix' | 'sql_database';
    connectorConfig?: any;
}
