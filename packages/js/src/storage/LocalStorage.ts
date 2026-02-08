import type { StorageAdapter } from './index';

interface StorageItem<T> {
  value: T;
  expiresAt?: number;
}

/**
 * LocalStorage adapter for persistent client-side storage
 * Used to cache license validation results across browser sessions
 */
export class LocalStorage implements StorageAdapter {
  private prefix: string;
  private knownKeys = new Set<string>();

  constructor(prefix: string = 'uls_') {
    this.prefix = prefix;
  }

  private getStorage(): {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    key?: (index: number) => string | null;
    length?: number;
  } | null {
    const anyGlobal = globalThis as any;
    if (anyGlobal?.localStorage) return anyGlobal.localStorage;
    if (typeof window !== 'undefined' && (window as any).localStorage)
      return (window as any).localStorage;
    return null;
  }

  private listKeys(storage: any): string[] {
    if (typeof storage?.key === 'function' && typeof storage?.length === 'number') {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    }

    // Fallback for minimal mocks (e.g. vitest) that don't expose key()/length.
    return Array.from(this.knownKeys);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      const item = storage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);

      // Check expiration
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        await this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('[LocalStorage] Get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const item: StorageItem<T> = {
        value,
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };

      const fullKey = this.getKey(key);
      storage.setItem(fullKey, JSON.stringify(item));
      this.knownKeys.add(fullKey);
    } catch (error) {
      console.error('[LocalStorage] Set error:', error);
      // QuotaExceededError handling
      const anyError = error as any;
      if (anyError?.name === 'QuotaExceededError') {
        // Clear expired items and retry
        await this.clearExpired();
        try {
          const item: StorageItem<T> = {
            value,
            expiresAt: ttl ? Date.now() + ttl : undefined,
          };
          const fullKey = this.getKey(key);
          storage.setItem(fullKey, JSON.stringify(item));
          this.knownKeys.add(fullKey);
        } catch (retryError) {
          console.error('[LocalStorage] Retry failed:', retryError);
        }
      }
    }
  }

  async remove(key: string): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const fullKey = this.getKey(key);
      storage.removeItem(fullKey);
      this.knownKeys.delete(fullKey);
    } catch (error) {
      console.error('[LocalStorage] Remove error:', error);
    }
  }

  async clear(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      // Only clear items with our prefix
      const keys = this.listKeys(storage);
      for (const storageKey of keys) {
        if (storageKey.startsWith(this.prefix)) {
          storage.removeItem(storageKey);
          this.knownKeys.delete(storageKey);
        }
      }
    } catch (error) {
      console.error('[LocalStorage] Clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear expired items from storage
   */
  private async clearExpired(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    const keys = this.listKeys(storage);
    const now = Date.now();

    for (const storageKey of keys) {
      if (!storageKey.startsWith(this.prefix)) continue;

      try {
        const item = storage.getItem(storageKey);
        if (!item) continue;

        const parsed: StorageItem<any> = JSON.parse(item);
        if (parsed.expiresAt && parsed.expiresAt < now) {
          storage.removeItem(storageKey);
          this.knownKeys.delete(storageKey);
        }
      } catch {
        // Remove corrupted items
        storage.removeItem(storageKey);
        this.knownKeys.delete(storageKey);
      }
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
