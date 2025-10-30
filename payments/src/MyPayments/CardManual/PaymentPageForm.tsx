import React, { useEffect, useState } from "react";
import "./PaymentPageForm.scss";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { Button } from "antd";
import img from "./hold-credit-card.svg";
import { PaymentPageInfoResponse } from "./service/CardManualService";
import { set } from "lodash";

interface PaymentPageFormProps {
    paymentInfo: PaymentPageInfoResponse;
}

const PaymentPageForm: React.FC<PaymentPageFormProps> = ({ paymentInfo }) => {
    const stripe = useStripe();
    const elements = useElements();

    // Track card form states
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // For credit vs. debit detection
    const [isCreditCard, setIsCreditCard] = useState(false);
    const [cardFundingType, setCardFundingType] = useState("");

    // For demonstration: base amount as a float
    const baseAmount = Number(paymentInfo.amount);

    // Surcharge & final amount
    const [surchargeFee, setSurchargeFee] = useState(0);
    const finalAmount = baseAmount + surchargeFee;

    // Track completion of each split element
    const [completeStates, setCompleteStates] = useState({
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false,
    });
    useEffect(() => {
        const detectCardType = async () => {
            // If all fields are complete, attempt to detect funding type
            if (stripe && elements && Object.values(completeStates).every(Boolean)) {
                try {
                    const cardNumberElement = elements.getElement(CardNumberElement);
                    if (!cardNumberElement) return;

                    const { paymentMethod, error } = await stripe.createPaymentMethod({
                        type: 'card',
                        card: cardNumberElement,
                    });

                    if (error) {
                        setError(error.message || null);
                    } else if (paymentMethod?.card) {
                        const funding = paymentMethod.card.funding;
                        if (funding === 'credit') {
                            setIsCreditCard(true);
                            setCardFundingType("credit");
                            setSurchargeFee(Number(paymentInfo?.amount_details?.surcharge ?? 0));
                        } else {
                            setIsCreditCard(false);
                            setCardFundingType("debit");
                            setSurchargeFee(0);
                        }
                    }
                } catch (err: any) {
                    setError(err.message);
                }
            }else {
                setIsCreditCard(false);
                setSurchargeFee(0);
                setCardFundingType("");
            }
        };
        detectCardType();
    }, [completeStates, elements, stripe, paymentInfo?.amount_details?.surcharge]);
    // Stripe Element styling (similar to your HTML example)
    const elementStyle = {
        base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": {
                color: "#aab7c4",
            },
        },
        invalid: {
            color: "#9e2146",
        },
    };

    /**
     * Generic onChange handler for each Element (CardNumber, CardExpiry, CardCvc)
     * Once all are complete, create a PaymentMethod to check card.funding
     */
    const handleChange = async (
        event: any,
        fieldName: "cardNumber" | "cardExpiry" | "cardCvc"
    ) => {
        setError(event.error ? event.error.message : null);
        console.log("Field:", fieldName, "Complete:", event.complete);
        // Update completion state
        setCompleteStates((prev) => ({
            ...prev,
            [fieldName]: event.complete,
        }));

        // If all fields are complete, attempt to detect funding type
        const allComplete =
            fieldName === "cardNumber"
                ? event.complete &&
                  completeStates.cardExpiry &&
                  completeStates.cardCvc
                : fieldName === "cardExpiry"
                ? event.complete &&
                  completeStates.cardNumber &&
                  completeStates.cardCvc
                : fieldName === "cardCvc"
                ? event.complete &&
                  completeStates.cardNumber &&
                  completeStates.cardExpiry
                : false;
        console.log("All complete:", allComplete,completeStates);
    };
    /**
     * Submits the form: create PaymentIntent on backend, confirmCardPayment, etc.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            // Convert finalAmount to smallest currency unit (e.g. cents for USD)
            const amountInCents = Math.round(finalAmount).toString();
            
            // 1) Create PaymentIntent on your backend
            const response = await fetch(
                `${paymentInfo.paymentExternalUrl}/stripe/moto-payment/create-payment-intent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        merchant_id: paymentInfo.merchant_id,
                    },
                    body: JSON.stringify({
                        amount: amountInCents,
                        currency: paymentInfo.currency,
                        metadata: paymentInfo.metadata,
                        amount_details: {
                            ...paymentInfo.amount_details,
                            surcharge: isCreditCard ? surchargeFee : 0,
                        }
                    }),
                }
            );

            const {
                payment_intent,
                transaction,
                error: intentError,
            } = await response.json();
            if (intentError) {
                throw new Error(intentError);
            }

            // 2) Confirm payment with Stripe
            const cardNumberElement = elements.getElement(CardNumberElement);
            if (!cardNumberElement) {
                throw new Error("CardNumberElement not found");
            }

            const { error: confirmError } = await stripe.confirmCardPayment(
                payment_intent.client_secret,
                {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            name: "Card Manual Key In - Payment",
                        },
                    },
                }
            );

            if (confirmError) {
                setError(
                    confirmError.message || "Payment confirmation failed."
                );
                window.location.href = paymentInfo.cancel_url;
                return;
            }

            // 3) Confirm the transaction on your backend
            await fetch(
                `${paymentInfo.paymentExternalUrl}/transaction/${transaction.id}/confirm`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        merchant_id: paymentInfo.merchant_id,
                    },
                }
            );
            await fetch(
                `${paymentInfo.paymentExternalUrl}/stripe/payment-page/${paymentInfo.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        merchant_id: paymentInfo.merchant_id,
                    },
                }
            );
            // If successful, redirect
            window.location.href = paymentInfo.success_url;
        } catch (err: any) {
            setError(err.message || null);
            window.location.href = paymentInfo.cancel_url;
        } finally {
            setProcessing(false);
        }
    };
    const handleClear = () => {
        const cardNumberElement = elements?.getElement(CardNumberElement);
        const cardExpiryElement = elements?.getElement(CardExpiryElement);
        const cardCvcElement = elements?.getElement(CardCvcElement);
    
        if (cardNumberElement) cardNumberElement.clear();
        if (cardExpiryElement) cardExpiryElement.clear();
        if (cardCvcElement) cardCvcElement.clear();
    
        setCompleteStates({
            cardNumber: false,
            cardExpiry: false,
            cardCvc: false,
        });
        setError(null);
        setIsCreditCard(false);
        setSurchargeFee(0);
        setCardFundingType("");
    };
    return (
        <div className="payment-card-container">
            <div className="card-container">
                <div className="card-header">
                    {/* <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230A72F9'%3E%3Cpath d='M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'/%3E%3C/svg%3E"
                    alt="Card icon"
                /> */}
                    <div className="d-flex align-items-center">
                        <img src={img} alt="Card icon" className="mr-2" />
                        <h3 className="card-title">Card Key In</h3>
                    </div>
                </div>
                {/* <div className="text-lg font-semibold">
                Amount: ${finalAmount.toFixed(2)}
            </div> */}

                <form
                    onSubmit={handleSubmit}
                    id="payment-form"
                    // className="space-y-4"
                    className="payment-form"
                >
                    {/* Card Number */}
                    <div className="form-group">
                        <label htmlFor="cardNumber" className="label-text">
                            Card Number
                        </label>
                        <div className="input-wrapper border rounded p-2 mt-2">
                            <CardNumberElement
                                id="cardNumber"
                                options={{ style: elementStyle }}
                                onChange={(e) => handleChange(e, "cardNumber")}
                            />
                        </div>
                    </div>

                    {/* Expiry & CVC side by side */}
                    <div className="row">
                        <div className="col form-group">
                            <label htmlFor="cardExpiry" className="label-text">
                                Expiration Date
                            </label>
                            <div className="input-wrapper border rounded p-2 mt-2">
                                <CardExpiryElement
                                    id="cardExpiry"
                                    options={{ style: elementStyle }}
                                    onChange={(e) =>
                                        handleChange(e, "cardExpiry")
                                    }
                                />
                            </div>
                        </div>
                        <div className="col form-group">
                            <label htmlFor="cardCvc" className="label-text">
                                Security Code
                            </label>
                            <div className="input-wrapper border rounded p-2 mt-2">
                                <CardCvcElement
                                    id="cardCvc"
                                    options={{ style: elementStyle }}
                                    onChange={(e) => handleChange(e, "cardCvc")}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="form-group">
            <label htmlFor="countryCode">Country Code</label>
            <div className="">
                <Select
                    defaultValue="India"
                    size="large"
                    className="w-full"
                    style={{ width: "100%" }}
                >
                    <Option value="India">India</Option>
                    <Option value="USA">USA</Option>
                    <Option value="UK">UK</Option>
                
                </Select>
                </div>
            </div> */}

                    {/* Error messages */}
                    {error && (
                        <div id="card-errors" className="text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Surcharge notice for credit cards */}
                    {(isCreditCard && surchargeFee > 0) && (
                        <div
                            id="surcharge-consent"
                            className="surcharge-notice text-blue-700 text-sm mt-3 flex items-center gap-2"
                        >
                            <span>ⓘ </span>
                            <span>
                                You will be assessed a surcharge amount for
                                using credit card
                            </span>
                        </div>
                    )}

                    {/* Display final amount */}
                    {/* <div className="mt-2 font-semibold">
                    Amount to Pay: ${finalAmount.toFixed(2)}
                </div> */}

                    {/* Buttons */}
                    <div className="button-container">
                        <Button
                            className="custom-cancel"
                            disabled={processing}
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button
                            className="custom-pay"
                            htmlType="submit"
                            disabled={
                                processing ||
                                !completeStates.cardNumber ||
                                !completeStates.cardExpiry ||
                                !completeStates.cardCvc ||
                                !cardFundingType
                            }
                        >
                            {'Pay'}
                        </Button>
                        <div></div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentPageForm;

