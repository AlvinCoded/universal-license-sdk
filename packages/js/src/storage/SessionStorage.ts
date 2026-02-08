import type { StorageAdapter } from './index';

interface StorageItem<T> {
  value: T;
  expiresAt?: number;
}

/**
 * SessionStorage adapter for temporary client-side storage
 * Data persists only for the current browser session
 */
export class SessionStorage implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'uls_') {
    this.prefix = prefix;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }

    try {
      const item = window.sessionStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);

      // Check expiration
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        await this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('[SessionStorage] Get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const item: StorageItem<T> = {
        value,
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };

      window.sessionStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('[SessionStorage] Set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('[SessionStorage] Remove error:', error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const keys = Object.keys(window.sessionStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          window.sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('[SessionStorage] Clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
