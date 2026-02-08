import { useCallback, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CheckTrialEligibilityRequest,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionDetailsResponse,
  TrialEligibilityResponse,
  TrialStatsResponse,
} from '@universal-license/client';

export function usePayment() {
  const { client } = useLicenseContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = useCallback(
    async (request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.createSubscription(request);
      } catch (err: any) {
        const msg = err?.message || 'Failed to create subscription';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const createPaymentIntent = useCallback(
    async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.createPaymentIntent(request);
      } catch (err: any) {
        const msg = err?.message || 'Failed to create payment intent';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const checkTrialEligibility = useCallback(
    async (request: CheckTrialEligibilityRequest): Promise<TrialEligibilityResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.checkTrialEligibility(request);
      } catch (err: any) {
        const msg = err?.message || 'Failed to check trial eligibility';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const cancelSubscription = useCallback(
    async (request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.cancelSubscription(request);
      } catch (err: any) {
        const msg = err?.message || 'Failed to cancel subscription';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const createPortalSession = useCallback(
    async (request: CreatePortalSessionRequest): Promise<CreatePortalSessionResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.createPortalSession(request);
      } catch (err: any) {
        const msg = err?.message || 'Failed to create portal session';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const getTrialStats = useCallback(async (): Promise<TrialStatsResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await client.payments.getTrialStats();
    } catch (err: any) {
      const msg = err?.message || 'Failed to get trial stats';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const getSubscriptionDetails = useCallback(
    async (subscriptionId: string): Promise<SubscriptionDetailsResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.payments.getSubscriptionDetails(subscriptionId);
      } catch (err: any) {
        const msg = err?.message || 'Failed to get subscription details';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    loading,
    error,
    createSubscription,
    createPaymentIntent,
    checkTrialEligibility,
    cancelSubscription,
    createPortalSession,
    getTrialStats,
    getSubscriptionDetails,
  };
}
