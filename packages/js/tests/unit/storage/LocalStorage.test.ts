import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorage } from '../../../src/storage/LocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorage', () => {
  let storage: LocalStorage;

  beforeEach(() => {
    localStorageMock.clear();
    storage = new LocalStorage('test_');
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      await storage.set('key1', 'value1');
      const value = await storage.get('key1');
      expect(value).toBe('value1');
    });

    it('should store complex objects', async () => {
      const obj = { name: 'Test', count: 42, active: true };
      await storage.set('obj', obj);
      const retrieved = await storage.get('obj');
      expect(retrieved).toEqual(obj);
    });

    it('should return null for non-existent keys', async () => {
      const value = await storage.get('nonexistent');
      expect(value).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect TTL and expire items', async () => {
      await storage.set('expiring', 'value', 100); // 100ms TTL

      // Should exist immediately
      let value = await storage.get('expiring');
      expect(value).toBe('value');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      value = await storage.get('expiring');
      expect(value).toBeNull();
    });

    it('should not expire items without TTL', async () => {
      await storage.set('permanent', 'value');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const value = await storage.get('permanent');
      expect(value).toBe('value');
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      await storage.set('toRemove', 'value');
      expect(await storage.get('toRemove')).toBe('value');

      await storage.remove('toRemove');
      expect(await storage.get('toRemove')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all items with prefix', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');

      // Add item with different prefix
      localStorage.setItem('other_key', 'value');

      await storage.clear();

      expect(await storage.get('key1')).toBeNull();
      expect(await storage.get('key2')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('value');
    });
  });

  describe('has', () => {
    it('should return true for existing keys', async () => {
      await storage.set('existing', 'value');
      expect(await storage.has('existing')).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      expect(await storage.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      await storage.set('expiring', 'value', 50);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await storage.has('expiring')).toBe(false);
    });
  });
});
