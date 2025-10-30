import React, { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import PaymentPageForm from "./PaymentPageForm";
import { useParams } from "react-router-dom";
import { getPaymentPageInfoById, PaymentPageInfoResponse } from "./service/CardManualService";
import Loading from "src/Shared/Components/Loading";
interface PaymentPageProps {
    paymentPageId: string;
}

export const PaymentPage: React.FC<PaymentPageProps> = () => {
    const [paymentInfo, setPaymentInfo] = useState<PaymentPageInfoResponse | null>(null);
    const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
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
        const response = await getPaymentPageInfoById(paymentPageId);
        setPaymentInfo(response);
        loadStripeInstance(response);
    }, []);
    useEffect(() => {
        if (!paymentPageId) {
            // For demo, we'll just mock the data here:
            setPaymentInfo(null);
        } else {
            loadPaymentInfo(paymentPageId);

        }
    }, [loadPaymentInfo, paymentPageId]);
    const loadStripeInstance = async (stripeInstanceDetails: {
        publishable_key: string;
        account_id: string;
    }) => {
        const stripe = await loadStripe(stripeInstanceDetails.publishable_key, {
            stripeAccount: stripeInstanceDetails.account_id,
        });
        setStripePromise(stripe);
    };

    if (!paymentInfo || !stripePromise) {
        return <Loading/>;
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentPageForm paymentInfo={paymentInfo} />
        </Elements>
    );
};

export default PaymentPage;

