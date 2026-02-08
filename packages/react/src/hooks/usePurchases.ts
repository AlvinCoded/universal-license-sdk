import { useCallback, useEffect, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  CompletePurchaseRequest,
  CompletePurchaseResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  PurchaseOrder,
} from '@universal-license/client';

export type PurchaseFilters = {
  status?: string;
  organizationId?: number;
  productCode?: string;
  limit?: number;
};

export function usePurchases(options?: { auto?: boolean; filters?: PurchaseFilters }) {
  const { client } = useLicenseContext();
  const auto = options?.auto ?? true;

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(
    async (filters?: PurchaseFilters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.purchases.getAll(filters);
        setPurchases(res);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch purchases');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const createOrder = useCallback(
    async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
      setError(null);
      try {
        const res = await client.purchases.createOrder(request);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to create order');
        throw err;
      }
    },
    [client]
  );

  const completePurchase = useCallback(
    async (request: CompletePurchaseRequest): Promise<CompletePurchaseResponse> => {
      setError(null);
      try {
        const res = await client.purchases.completePurchase(request);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to complete purchase');
        throw err;
      }
    },
    [client]
  );

  const getOrder = useCallback(
    async (orderId: string): Promise<PurchaseOrder> => {
      setError(null);
      try {
        return await client.purchases.getOrder(orderId);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch order');
        throw err;
      }
    },
    [client]
  );

  useEffect(() => {
    if (!auto) return;
    void fetchPurchases(options?.filters);
  }, [auto, fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    refetch: fetchPurchases,
    createOrder,
    completePurchase,
    getOrder,
  };
}
