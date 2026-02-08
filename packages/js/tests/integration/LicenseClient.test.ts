import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { LicenseClient } from '../../src/LicenseClient';
import { DeviceFingerprint } from '@unilic/core';

/**
 * Integration tests for LicenseClient
 * These tests mock the HTTP layer but test the full SDK workflow
 */

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      }),
    },
  };
});

describe('LicenseClient Integration', () => {
  let client: LicenseClient;

  beforeAll(() => {
    client = new LicenseClient({
      baseUrl: 'http://localhost:3001/api',
      cache: true,
      debug: false,
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct config', () => {
      const config = client.getConfig();

      expect(config.baseUrl).toBe('http://localhost:3001/api');
      expect(config.cache).toBe(true);
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
    });

    it('should throw error without baseUrl', () => {
      expect(() => new LicenseClient({} as any)).toThrow('baseUrl is required');
    });

    it('should have all modules initialized', () => {
      expect(client.licenses).toBeDefined();
      expect(client.purchases).toBeDefined();
      expect(client.products).toBeDefined();
      expect(client.renewals).toBeDefined();
      expect(client.validation).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should update config at runtime', () => {
      client.setConfig({ timeout: 60000 });

      const config = client.getConfig();
      expect(config.timeout).toBe(60000);
    });

    it('should set auth token', () => {
      client.setToken('test-token-123');

      const config = client.getConfig();
      expect(config.apiKey).toBe('test-token-123');
    });

    it('should clear auth token', () => {
      client.setToken(null);

      const config = client.getConfig();
      expect(config.apiKey).toBeUndefined();
    });
  });

  describe('Helper Methods', () => {
    it('should generate device fingerprint', async () => {
      const deviceId = await DeviceFingerprint.generate();

      expect(deviceId).toBeDefined();
      expect(typeof deviceId).toBe('string');
      expect(deviceId.length).toBe(64); // SHA-256 hash
    });

    it('should validate device ID format', () => {
      const validId = 'a'.repeat(64);
      const invalidId = 'invalid';

      expect(DeviceFingerprint.isValidDeviceId(validId)).toBe(true);
      expect(DeviceFingerprint.isValidDeviceId(invalidId)).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      // This should not throw
      expect(() => client.clearCache()).not.toThrow();
    });
  });

  describe('Static Methods', () => {
    it('should create storage adapter', () => {
      const localStorage = LicenseClient.createStorage('local', 'test_');
      const sessionStorage = LicenseClient.createStorage('session', 'test_');
      const memoryStorage = LicenseClient.createStorage('memory', 'test_');

      expect(localStorage).toBeDefined();
      expect(sessionStorage).toBeDefined();
      expect(memoryStorage).toBeDefined();
    });

    it('should throw error for invalid storage type', () => {
      expect(() => LicenseClient.createStorage('invalid' as any)).toThrow();
    });
  });
});
