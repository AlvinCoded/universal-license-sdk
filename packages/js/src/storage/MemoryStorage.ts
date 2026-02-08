import type { StorageAdapter } from './index';

interface StorageItem<T> {
  value: T;
  expiresAt?: number;
}

/**
 * In-memory storage adapter
 * Used for Node.js environments or when browser storage is unavailable
 * Data is lost when the application closes
 */
export class MemoryStorage implements StorageAdapter {
  private store: Map<string, StorageItem<any>>;
  private prefix: string;

  constructor(prefix: string = 'uls_') {
    this.store = new Map();
    this.prefix = prefix;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const item = this.store.get(this.getKey(key));
    if (!item) return null;

    // Check expiration
    if (item.expiresAt && item.expiresAt < Date.now()) {
      await this.remove(key);
      return null;
    }

    return item.value as T;
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const item: StorageItem<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl : undefined,
    };

    this.store.set(this.getKey(key), item);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(this.getKey(key));
  }

  async clear(): Promise<void> {
    // Clear all items with our prefix
    const keys = Array.from(this.store.keys());
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        this.store.delete(key);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get the size of the storage
   */
  size(): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
