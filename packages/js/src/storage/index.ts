/**
 * Storage adapters for license data persistence
 * Used by LicenseCache to store validated licenses
 */

export interface StorageAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export { LocalStorage } from './LocalStorage';
export { SessionStorage } from './SessionStorage';
export { MemoryStorage } from './MemoryStorage';
