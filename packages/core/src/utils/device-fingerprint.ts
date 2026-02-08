/**
 * Device fingerprinting utilities
 * Generates unique device identifiers for license validation
 */

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  language: string;
  hardwareConcurrency: number;
  colorDepth?: number;
  pixelRatio?: number;
}

export interface NodeDeviceInfo {
  platform: string;
  arch: string;
  hostname: string;
  cpus: number;
  nodeVersion: string;
  totalMemory: number;
}

export class DeviceFingerprint {
  /**
   * Generate device fingerprint for browser environment
   * This creates a consistent hash that will be used for license validation
   */
  static async generate(): Promise<string> {
    if (typeof window === 'undefined') {
      return this.generateNodeFingerprint();
    }

    return this.generateBrowserFingerprint();
  }

  /**
   * Generate fingerprint from browser info
   */
  private static async generateBrowserFingerprint(): Promise<string> {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    };

    // Create a stable string representation
    const fingerprint = JSON.stringify(info, Object.keys(info).sort());
    return this.hash(fingerprint);
  }

  /**
   * Generate fingerprint for Node.js environment
   * Uses system information similar to your backend validation
   */
  private static async generateNodeFingerprint(): Promise<string> {
    // Dynamic import to avoid issues in browser
    const os = await import('os');

    const info: NodeDeviceInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
    };

    const fingerprint = JSON.stringify(info, Object.keys(info).sort());
    return this.hash(fingerprint);
  }

  /**
   * Hash a string using SHA-256
   * Compatible with browser and Node.js
   */
  private static async hash(str: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Browser environment with Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const { createHash } = await import('crypto');
      return createHash('sha256').update(str).digest('hex');
    }
  }

  /**
   * Validate device ID format
   */
  static isValidDeviceId(deviceId: string): boolean {
    // Should be a 64-character hex string (SHA-256)
    return /^[a-f0-9]{64}$/i.test(deviceId);
  }

  /**
   * Get human-readable device info (without hashing)
   * Useful for debugging
   */
  static async getDeviceInfo(): Promise<DeviceInfo | NodeDeviceInfo> {
    if (typeof window === 'undefined') {
      const os = await import('os');
      return {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }
}
