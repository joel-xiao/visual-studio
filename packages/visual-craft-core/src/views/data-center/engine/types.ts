export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Single request step in a chain
 */
export interface IBaseStep {
    id: string;
    name: string;
    type: 'http' | 'sql' | 'redis' | 'mqtt' | 'websocket' | 'modbus' | 'reference';
    condition?: string;
    transformation?: { script: string; };
}

export interface IHttpStep extends IBaseStep {
    type: 'http';
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    bodyMode?: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'json';
    body?: any;
    auth?: any;
}

export interface ISqlStep extends IBaseStep {
    type: 'sql';
    dbType: 'mysql' | 'postgres' | 'oracle';
    host: string;
    port: number;
    username?: string;
    password?: string;
    database: string;
    query: string;
}

export interface IRedisStep extends IBaseStep {
    type: 'redis';
    host: string;
    port: number;
    password?: string;
    db: number;
    command: string;
    args: Record<string, any>;
}

export interface IMqttStep extends IBaseStep {
    type: 'mqtt';
    brokerUrl: string;
    port: number;
    username?: string;
    password?: string;
    action: 'publish' | 'subscribe';
    topic: string;
    payload?: any;
    qos: 0 | 1 | 2;
}

export interface IReferenceStep extends IBaseStep {
    type: 'reference';
    refId: string;
    variables: Record<string, any>;
}

export interface IModbusStep extends IBaseStep {
    type: 'modbus';
    functionCode: number; // 1 (Read Coils), 2 (Read Discrete Inputs), 3 (Read Holding Regs), 4 (Read Input Regs), 5 (Write Single Coil), 6 (Write Single Reg), 15 (Write Multiple Coils), 16 (Write Multiple Regs)
    address: number;
    quantity?: number;
    value?: number | number[] | boolean | boolean[];
}

export interface IWebsocketStep extends IBaseStep {
    type: 'websocket';
    action: 'send' | 'listen';
    payload: string; // JSON or text
    format: 'text' | 'json';
    timeout?: number;
}

export type IRequestStep = IHttpStep | ISqlStep | IRedisStep | IMqttStep | IWebsocketStep | IModbusStep | IReferenceStep;

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
