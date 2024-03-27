interface DBConfig {
  dbName: string;
  storeName: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  constructor(private config: DBConfig) {
      this.init();
  }

  private init(): void {
      const request: IDBOpenDBRequest = indexedDB.open(this.config.dbName);

      request.onerror = (event: Event) => {
          console.error("Database error: " + (event.target as IDBOpenDBRequest).error);
      };

      request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
          console.log("Database opened successfully");
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
          if (!this.db.objectStoreNames.contains(this.config.storeName)) {
              this.db.createObjectStore(this.config.storeName, { keyPath: 'id', autoIncrement: true });
          }
      };
  }

  public add<T>(item: T, callback?: () => void, errorCallback?: (error: any) => void): void {
      if (!this.db) {
          console.error("Database not initialized");
          return;
      }
      const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readwrite');
      const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
      const request: IDBRequest<IDBValidKey> = store.add(item);
      request.onerror = (event: Event) => {
          console.error("Error adding item: " + (event.target as IDBRequest).error);
          if (errorCallback) errorCallback((event.target as IDBRequest).error);
      };
      request.onsuccess = (event: Event) => {
          console.log("Item added successfully");
          if (callback) callback();
      };
  }

  public find<T>(key: number | string, callback: (item: T | null) => void, errorCallback?: (error: any) => void): void {
    if (!this.db) {
        console.error("Database not initialized");
        return;
    }
    const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readonly');
    const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
    const request: IDBRequest<T | undefined> = store.get(key);

    request.onerror = (event: Event) => {
        console.error("Error finding item: " + (event.target as IDBRequest<T | undefined>).error);
        if (errorCallback) errorCallback((event.target as IDBRequest<T | undefined>).error);
    };
    request.onsuccess = (event: Event) => {
        const item: T | undefined = (event.target as IDBRequest<T | undefined>).result;
        if (item !== undefined) {
            callback(item);
        } else {
            callback(null);
        }
    };
  }

  public getAll<T>(callback: (items: T[]) => void, errorCallback?: (error: any) => void): void {
      if (!this.db) {
          console.error("Database not initialized");
          return;
      }
      const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readonly');
      const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
      const request: IDBRequest<IDBCursorWithValue | null> = store.openCursor();

      const items: T[] = [];
      request.onerror = (event: Event) => {
          console.error("Error getting items: " + (event.target as IDBRequest).error);
          if (errorCallback) errorCallback((event.target as IDBRequest).error);
      };
      request.onsuccess = (event: Event) => {
          const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;
          if (cursor) {
              items.push(cursor.value);
              cursor.continue();
          } else {
              callback(items);
          }
      };
  }

  public delete(key: number | string, callback?: () => void, errorCallback?: (error: any) => void): void {
      if (!this.db) {
          console.error("Database not initialized");
          return;
      }
      const transaction: IDBTransaction = this.db.transaction([this.config.storeName], 'readwrite');
      const store: IDBObjectStore = transaction.objectStore(this.config.storeName);
      const request: IDBRequest = store.delete(key);
      request.onerror = (event: Event) => {
          console.error("Error deleting item: " + (event.target as IDBRequest).error);
          if (errorCallback) errorCallback((event.target as IDBRequest).error);
      };
      request.onsuccess = (event: Event) => {
          console.log("Item deleted successfully");
          if (callback) callback();
      };
  }
}
