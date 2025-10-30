// src/MyPayments/SaveAndPay/hooks/useFetchMerchantDetails.ts
import { useState, useEffect } from 'react';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { getStripePaymentPageInfo } from '../service/SaveAndPayService';
import type { IMerchantDetails } from '../service/SaveAndPayService';
import type { PayrixPaymentPageInfo } from 'src/Payrix/Models/Payrix.modal';

interface UseFetchMerchantDetailsProps {
    merchantId: string;
    customerId: string;
    paymentPageId: string;
}

interface UseFetchMerchantDetailsReturn {
    stripePromise: Stripe | null;
    merchantDetails: IMerchantDetails | null;
    isLoading: boolean;
    error: string | null;
}

export const useFetchMerchantDetails = ({
    merchantId,
    customerId,
    paymentPageId
}: UseFetchMerchantDetailsProps): UseFetchMerchantDetailsReturn => {
    const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
    const [merchantDetails, setMerchantDetails] = useState<IMerchantDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStripeInstance = async (publishableKey: string) => {
        try {
            const stripe = await loadStripe(publishableKey);
            setStripePromise(stripe);
        } catch (err) {
            setError('Failed to load Stripe instance');
        }
    };

    useEffect(() => {
        const fetchMerchantDetails = async () => {
            try {
                setIsLoading(true);
                if (merchantId && customerId) {
                    const response: PayrixPaymentPageInfo = 
                        await getStripePaymentPageInfo(paymentPageId);
                    
                    await loadStripeInstance(response.publishable_key ?? '');
                    
                    const base_url = response.paymentExternalUrl;
                    setMerchantDetails({
                        publishable_key: response.publishable_key ?? '',
                        account_id: response.account_id,
                        base_url: base_url ?? '',
                        merchantId,
                        customerId,
                        metadata: response.metadata,
                        amount: response.amount,
                        currency: response.currency,
                        success_url: response.success_url,
                        cancel_url: response.cancel_url,
                    });
                }
            } catch (err) {
                setError('Failed to fetch merchant details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMerchantDetails();
    }, [merchantId, customerId, paymentPageId]);

    return {
        stripePromise,
        merchantDetails,
        isLoading,
        error
    };
};