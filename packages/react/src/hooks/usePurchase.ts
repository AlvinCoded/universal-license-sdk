import { useState, useCallback } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type { CreateOrderResponse } from '@unilic/client';

/**
 * usePurchase Hook
 * Handle purchase flow (create order, complete purchase)
 *
 * @example
 * ```tsx
 * function CheckoutPage() {
 *   const { createOrder, completePurchase, loading } = usePurchase();
 *
 *   const handleCheckout = async (planCode: string) => {
 *     const order = await createOrder({
 *       planCode,
 *       organizationData: { orgName: 'Acme Corp', ... }
 *     });
 *
 *     // Redirect to payment gateway with order.orderId
 *     redirectToStripe(order.orderId);
 *   };
 *
 *   return <button onClick={() => handleCheckout('PRO-ANNUAL')}>Subscribe</button>;
 * }
 * ```
 */
export function usePurchase() {
  const { client } = useLicenseContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreateOrderResponse['order'] | null>(null);

  const createOrder = useCallback(
    async (data: {
      planCode: string;
      organizationData: {
        orgName: string;
        ownerName: string;
        ownerEmail: string;
        phone?: string;
        address?: string;
        country?: string;
        orgType?: string;
      };
      paymentMethod?: string;
      metadata?: Record<string, unknown>;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.purchases.createOrder(data);
        setOrder(result.order);
        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const completePurchase = useCallback(
    async (data: { orderId: string; paymentReference: string }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.purchases.completePurchase(data);

        // Store license key
        if (result.license?.licenseKey) {
          localStorage.setItem('licenseKey', result.license.licenseKey);
        }

        return result;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete purchase';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const startTrial = useCallback(
    async (data: {
      planCode: string;
      organizationData: {
        orgName: string;
        ownerName: string;
        ownerEmail: string;
        phone?: string;
        address?: string;
        country?: string;
        orgType?: string;
      };
      deviceFingerprint?: string | null;
      metadata?: Record<string, unknown>;
    }) => {
      setLoading(true);
      setError(null);

      try {
        return await client.purchases.startTrial(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start trial';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    order,
    loading,
    error,
    createOrder,
    completePurchase,
    startTrial,
  };
}
