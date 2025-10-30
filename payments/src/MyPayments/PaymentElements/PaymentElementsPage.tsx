import React, { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import PaymentElementsForm from "./PaymentElementsForm";
import { useParams } from "react-router-dom";
import { getPaymentPageInfoById, PaymentPageInfoResponse } from "./service/PaymentElementsService";
import Loading from "src/Shared/Components/Loading";

interface PaymentPageProps {
    paymentPageId: string;
}

export const PaymentElementsPage: React.FC<PaymentPageProps> = () => {
    const [paymentInfo, setPaymentInfo] = useState<PaymentPageInfoResponse | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentPageId, setPaymentPageId] = useState<string | null>(null);
    
    const { paymentPageId: paymentIdFromPath } = useParams<{
        paymentPageId: string;
    }>();
    
    useEffect(() => {
        if (paymentIdFromPath) {
            console.log("Payment ID from path:", paymentIdFromPath);
            setPaymentPageId(paymentIdFromPath);
        }
    }, [paymentIdFromPath]);
    
    const loadPaymentInfo = useCallback(async(paymentPageId: string) => {
        console.log("Loading payment info for ID:", paymentPageId);
        try {
            const response = await getPaymentPageInfoById(paymentPageId);
            
            
            // Load Stripe instance
            const stripePromise = loadStripe(response.publishable_key, {
                stripeAccount: response.account_id,
            });
            setStripePromise(stripePromise);
            
            // Create a payment intent to get a client secret
            // This step may be different based on your implementation
            // If your API already provides a client_secret in the payment info, use that instead
            if (response.client_secret) {
                setClientSecret(response.client_secret);
            } else {
                // Create a payment intent to get a client secret
                const intentResponse = await fetch(
                    `${response.paymentExternalUrl}/stripe/moto-payment/create-payment-intent`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            merchant_id: response.merchant_id,
                        },
                        body: JSON.stringify({
                            amount: response.amount,
                            currency: response.currency,
                            metadata: response.metadata,
                            amount_details: response.amount_details,
                            payment_mode : response.payment_mode,
                            options: response.options,
                        }),
                    }
                );
                const { payment_intent, transaction } = await intentResponse.json();
                console.log("Payment intent response:", payment_intent,transaction);
                setClientSecret(payment_intent.client_secret);
                setPaymentInfo({
                    ...response,
                    paymentIntentId: payment_intent.id,
                    transactionId: transaction.id,
                    client_secret: payment_intent.client_secret,
                });
            }
        } catch (error) {
            console.error("Error loading payment info:", error);
        }
    }, []);
    
    useEffect(() => {
        if (paymentPageId) {
            loadPaymentInfo(paymentPageId);
        }
    }, [loadPaymentInfo, paymentPageId]);
    
    if (!paymentInfo || !stripePromise || !clientSecret) {
        return <Loading />;
    }
    
    // Configure Stripe Elements options
    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0a72f9',
                colorBackground: '#ffffff',
                colorText: '#424770',
                colorDanger: '#9e2146',
            },
        },
        // Enable Apple Pay
        loader: 'auto',
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentElementsForm paymentInfo={paymentInfo} wallets_only={paymentInfo.wallets_only || false} />
        </Elements>
    );
};

export default PaymentElementsPage;