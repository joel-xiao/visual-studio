export * from './db/indexeddb';

import { IndexedDBService, type IndexedDBConfig, type IndexedDBServiceApi } from './db/indexeddb';

export type ServerDBRuntime = {
  createIndexedDBService: (config: IndexedDBConfig) => IndexedDBServiceApi;
};

const DEFAULT_SERVER_DB_RUNTIME: ServerDBRuntime = {
  createIndexedDBService: (config) => new IndexedDBService(config)
};

let serverDBRuntime: ServerDBRuntime = DEFAULT_SERVER_DB_RUNTIME;
let serverDBRuntimeVersion = 0;

export function initServerDBRuntime(runtime?: Partial<ServerDBRuntime>) {
  serverDBRuntime = {
    ...serverDBRuntime,
    ...(runtime || {})
  };
  serverDBRuntimeVersion += 1;
}

export function getServerDBRuntime(): ServerDBRuntime {
  return serverDBRuntime;
}

export function getServerDBRuntimeVersion(): number {
  return serverDBRuntimeVersion;
}
