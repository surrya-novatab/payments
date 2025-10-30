import { Elements } from "@stripe/react-stripe-js";
import CardForm from "./CardForm";
import Loading from "../../Shared/Components/Loading";
import { useParams } from "react-router-dom";
import { useFetchMerchantDetails } from "./hooks/useFetchMerchantDetails";

const SaveAndPay = () => {
    const { merchantId, customerId, paymentPageId } = useParams<{
        merchantId: string;
        customerId: string;
        paymentPageId: string;
    }>();

    const { 
        merchantDetails, 
        stripePromise,
    } = useFetchMerchantDetails({
        merchantId,
        customerId,
        paymentPageId
    });
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

export default SaveAndPay;
