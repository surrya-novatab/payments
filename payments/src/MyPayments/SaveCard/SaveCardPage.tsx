import { Elements } from "@stripe/react-stripe-js";
import CardForm from "./CardForm";
import { useEffect, useState } from "react";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import Loading from "src/Shared/Components/Loading";
import { useParams } from "react-router-dom";
import useQueryParams from "src/hooks/useQueryParams";
import {
    getStripeDetailsByMerchantID,
    IMerchantDetails,
    IStripeDetails,
} from "./service/SavedCardService";

const SaveCardPage = () => {
    const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
    const { merchantId, customerId } = useParams<{
        merchantId: string;
        customerId: string;
    }>();
    const [merchantDetails, setMerchantDetails] = useState<IMerchantDetails | null>(null);
    const params = useQueryParams();

    const loadStripeInstance = async (stripeInstanceDetails: { publishable_key: string }) => {
        const stripe = await loadStripe(stripeInstanceDetails.publishable_key);
        setStripePromise(stripe);
    };

    useEffect(() => {
        const fetchMerchantDetails = async () => {
            if (merchantId && customerId) {
                const response: IStripeDetails = await getStripeDetailsByMerchantID(merchantId);
                loadStripeInstance({
                    publishable_key: response.publishable_key,
                });
                setMerchantDetails({
                    publishable_key: response.publishable_key,
                    account_id: response.account_id,
                    base_url: response.base_url,
                    merchantId: merchantId,
                    customerId: customerId,
                });
            }
        };
        fetchMerchantDetails();
    }, [merchantId, customerId]);

    if (!stripePromise) {
        return <Loading />;
    }
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Elements stripe={stripePromise}>
                <CardForm merchantDetailsInfo={merchantDetails} />
            </Elements>
        </div>
    );
};

export default SaveCardPage;
