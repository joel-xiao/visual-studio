export interface IndexedDBConfig {
  dbName: string;
  storeName: string;
}

export type IndexedDBServiceApi = {
  add<T>(item: T, callback?: () => void, errorCallback?: (error: Error | DOMException) => void): void;
  find<T>(
    key: number | string,
    callback: (item: T | null) => void,
    errorCallback?: (error: Error | DOMException) => void
  ): void;
  getAll<T>(callback: (items: T[]) => void, errorCallback?: (error: Error | DOMException) => void): void;
  delete(key: number | string, callback?: () => void, errorCallback?: (error: Error | DOMException) => void): void;
};

export class IndexedDBService implements IndexedDBServiceApi {
  private db: IDBDatabase | null = null;

  constructor(private config: IndexedDBConfig) {
    this.init();
  }

  private init(): void {
    const request: IDBOpenDBRequest = indexedDB.open(this.config.dbName);

    request.onerror = (_event: Event) => {
      return;
    };

    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      if (!this.db.objectStoreNames.contains(this.config.storeName)) {
        this.db.createObjectStore(this.config.storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  }

  public add<T>(
    item: T,
    callback?: () => void,
    errorCallback?: (error: Error | DOMException) => void
  ): void {
    if (!this.db) return;

    const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
    const request: IDBRequest<IDBValidKey> = store.add(item);
    request.onerror = (_event: Event) => {
      if (errorCallback && request.error) errorCallback(request.error as Error | DOMException);
    };
    request.onsuccess = (_event: Event) => {
      if (callback) callback();
    };
  }

  public find<T>(
    key: number | string,
    callback: (item: T | null) => void,
    errorCallback?: (error: Error | DOMException) => void
  ): void {
    if (!this.db) return;

    const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readonly');
    const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
    const request: IDBRequest<T | undefined> = store.get(key);

    request.onerror = (_event: Event) => {
      if (errorCallback && request.error) errorCallback(request.error as Error | DOMException);
    };
    request.onsuccess = (_event: Event) => {
      const item: T | undefined = request.result;
      callback(item !== undefined ? item : null);
    };
  }

  public getAll<T>(
    callback: (items: T[]) => void,
    errorCallback?: (error: Error | DOMException) => void
  ): void {
    if (!this.db) return;

    const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readonly');
    const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
    const request: IDBRequest<IDBCursorWithValue | null> = store.openCursor();

    const items: T[] = [];
    request.onerror = (_event: Event) => {
      if (errorCallback && request.error) errorCallback(request.error as Error | DOMException);
    };
    request.onsuccess = (_event: Event) => {
      const cursor: IDBCursorWithValue | null = request.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        callback(items);
      }
    };
  }

  public delete(
    key: number | string,
    callback?: () => void,
    errorCallback?: (error: Error | DOMException) => void
  ): void {
    if (!this.db) return;

    const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
    const request: IDBRequest = store.delete(key);
    request.onerror = (_event: Event) => {
      if (errorCallback && request.error) errorCallback(request.error as Error | DOMException);
    };
    request.onsuccess = (_event: Event) => {
      if (callback) callback();
    };
  }
}
