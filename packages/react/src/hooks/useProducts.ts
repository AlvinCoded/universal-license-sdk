import { useState, useEffect } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type { Product, SubscriptionPlan } from '@universal-license/client';

/**
 * useProducts Hook
 * Fetch products and their plans
 *
 * Used in pricing pages and product selection
 * Used in pricing pages and product selection.
 *
 * @example
 * ```tsx
 * function PricingPage() {
 *   const { products, loading, getPlans } = useProducts();
 *
 *   return (
 *     <div>
 *       {products.map(product => (
 *         <ProductCard key={product.productCode} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProducts() {
  const { client } = useLicenseContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await client.products.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const getPlans = async (productCode: string): Promise<SubscriptionPlan[]> => {
    try {
      return await client.products.getPlans(productCode);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plans');
      return [];
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getPlans,
  };
}
