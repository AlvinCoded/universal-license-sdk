// packages/react/examples/basic-setup.tsx
/**
 * Basic React Setup Example
 * Shows minimal configuration to get started
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { LicenseProvider, useLicenseValidation } from '@universal-license/react';

// Your onboarding component
function OnboardingPage() {
  const [licenseKey, setLicenseKey] = React.useState('');
  const { validation, loading, validate } = useLicenseValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validate(licenseKey);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Enter Your License Key</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="PROD-ORG-2025-XXXX-XXXX-XXXX"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        <button
          type="submit"
          disabled={loading || !licenseKey}
          style={{ width: '100%', padding: '10px' }}
        >
          {loading ? 'Validating...' : 'Activate License'}
        </button>
      </form>

      {validation && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '5px',
            backgroundColor: validation.valid ? '#d4edda' : '#f8d7da',
            color: validation.valid ? '#155724' : '#721c24',
          }}
        >
          {validation.valid ? (
            <>
              <h3>✓ License Activated!</h3>
              <p>Organization: {validation.license?.orgName}</p>
              <p>Tier: {validation.license?.tier}</p>
            </>
          ) : (
            <>
              <h3>✗ Validation Failed</h3>
              <p>{validation.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// App with LicenseProvider
function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: import.meta.env.VITE_LICENSE_API_URL || 'http://localhost:3001/api',
        cache: true,
      }}
    >
      <OnboardingPage />
    </LicenseProvider>
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
