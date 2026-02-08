/**
 * Dashboard Integration Example
 * Shows how to integrate with your existing admin dashboard
 */

import React from 'react';
import {
  LicenseProvider,
  useLicense,
  useProducts,
  useFeatureFlag,
  LicenseGuard,
  FeatureGate,
} from '@universal-license/react';

// Dashboard Component
function Dashboard() {
  const licenseKey = localStorage.getItem('licenseKey');
  const { license, loading, error } = useLicense(licenseKey);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error loading license: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      {/* License Info Card */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h2>Your License</h2>
        <p>
          <strong>Organization:</strong> {license?.org_name}
        </p>
        <p>
          <strong>Product:</strong> {license?.product_code}
        </p>
        <p>
          <strong>Tier:</strong> {license?.tier}
        </p>
        <p>
          <strong>Status:</strong> {license?.status}
        </p>
        <p>
          <strong>Expires:</strong> {new Date(license?.expires_at || '').toLocaleDateString()}
        </p>
      </div>

      {/* Feature-gated content */}
      <FeatureGate
        feature="advancedReporting"
        fallback={
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h3>Advanced Reporting</h3>
            <p>Upgrade to Pro to unlock advanced reporting features.</p>
            <button>Upgrade Now</button>
          </div>
        }
      >
        <div
          style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>Advanced Reports</h2>
          <p>Your advanced reporting dashboard...</p>
          {/* Advanced reporting UI */}
        </div>
      </FeatureGate>
    </div>
  );
}

// Pricing Page (similar to your purchase flow)
function PricingPage() {
  const { products, loading, getPlans } = useProducts();
  const [selectedProduct, setSelectedProduct] = React.useState<string | null>(null);
  const [plans, setPlans] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (selectedProduct) {
      getPlans(selectedProduct).then(setPlans);
    }
  }, [selectedProduct, getPlans]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Choose Your Plan</h1>

      {/* Product Selection */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Select Product</h2>
        {products.map((product) => (
          <button
            key={product.productCode}
            onClick={() => setSelectedProduct(product.productCode)}
            style={{
              margin: '5px',
              padding: '10px 20px',
              backgroundColor: selectedProduct === product.productCode ? '#007bff' : '#fff',
              color: selectedProduct === product.productCode ? '#fff' : '#000',
              border: '1px solid #007bff',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {product.productName}
          </button>
        ))}
      </div>

      {/* Plans Display */}
      {plans.length > 0 && (
        <div>
          <h2>Available Plans</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.planCode}
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3>{plan.planName}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ${plan.priceAmount} {plan.priceCurrency}
                </p>
                <p>{plan.durationDays} days</p>
                <p>Tier: {plan.tier}</p>
                <p>Max Users: {plan.maxUsers || 'Unlimited'}</p>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Protected App (requires valid license)
function ProtectedApp() {
  const licenseKey = localStorage.getItem('licenseKey');

  return (
    <LicenseGuard
      licenseKey={licenseKey || ''}
      fallback={
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>License Required</h2>
          <p>Please activate your license to access the application.</p>
          <button onClick={() => (window.location.href = '/pricing')}>Get a License</button>
        </div>
      }
      loadingFallback={<div>Verifying license...</div>}
    >
      <Dashboard />
    </LicenseGuard>
  );
}

// Main App with Router (simplified)
export function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  return (
    <LicenseProvider
      config={{
        baseUrl: import.meta.env.VITE_LICENSE_API_URL || 'http://localhost:3001/api',
        cache: true,
        debug: import.meta.env.DEV,
      }}
    >
      {/* Simple Navigation */}
      <nav
        style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '20px',
        }}
      >
        <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentPage('pricing')}>Pricing</button>
      </nav>

      {/* Page Rendering */}
      {currentPage === 'dashboard' && <ProtectedApp />}
      {currentPage === 'pricing' && <PricingPage />}
    </LicenseProvider>
  );
}
