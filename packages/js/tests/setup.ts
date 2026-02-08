/**
 * Vitest setup file
 * Runs before all tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup code that runs once before all tests
  console.log('🧪 Setting up test environment...');
});

afterAll(() => {
  // Cleanup code that runs once after all tests
  console.log('✅ Test environment cleaned up');
});
