import { createContext, useContext, useMemo, ReactNode } from 'react';
import { LicenseClient } from '@universal-license/client';
import type { SDKConfig } from '@universal-license/client';

/**
 * License Context
 * Provides the LicenseClient instance throughout your React app
 *
 */

interface LicenseContextValue {
  client: LicenseClient;
}

const LicenseContext = createContext<LicenseContextValue | null>(null);

interface LicenseProviderProps {
  config: SDKConfig;
  children: ReactNode;
}

/**
 * LicenseProvider - Wrap your app with this to provide the SDK client
 *
 * @example
 * ```tsx
 * import { LicenseProvider } from '@universal-license/react';
 *
 * function App() {
 *   return (
 *     <LicenseProvider config={{
 *       baseUrl: process.env.REACT_APP_LICENSE_API_URL!,
 *       cache: true
 *     }}>
 *       <YourApp />
 *     </LicenseProvider>
 *   );
 * }
 * ```
 */
export function LicenseProvider({ config, children }: LicenseProviderProps) {
  const client = useMemo(
    () => new LicenseClient(config),
    [config.baseUrl, config.apiKey, config.timeout]
  );

  const value = useMemo(() => ({ client }), [client]);

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

/**
 * useLicenseContext - Get the LicenseClient instance
 *
 * @example
 * ```tsx
 * const { client } = useLicenseContext();
 * await client.validate({ licenseKey, deviceId });
 * ```
 */
export function useLicenseContext(): LicenseContextValue {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error('useLicenseContext must be used within LicenseProvider');
  }

  return context;
}
