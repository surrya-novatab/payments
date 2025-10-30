import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockIcon from "@mui/icons-material/Lock";
import PaymentIcon from "@mui/icons-material/Payment";
import img from "../CardManual/hold-credit-card.svg";

import {
    handleStripeLog,
    IMerchantDetails,
    notifyViaPostMessage,
    stripeSaveAndPay,
} from "./service/SaveAndPayService";
import styles from "./CardForm.module.scss";
import Loading from "src/Shared/Components/Loading";

declare global {
    interface Window {
        NovaSaveCardChannel: {
            postMessage(message: string): void;
        };
    }
}

interface CardFormProps {
    merchantDetailsInfo: IMerchantDetails | null;
}

const CardForm: React.FC<CardFormProps> = ({ merchantDetailsInfo }) => {
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const [customerId, setCustomerId] = useState<string>("");

    const handleChange = (event: { error?: { type: string; code: string; message: string } }) => {
        setError(event.error ? event.error.message : null);
    };

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setProcessing(true);
        try {
            if (!stripe || !elements) {
                // Stripe.js has not loaded yet
                setProcessing(false);
                return;
            }
            const cardElement = elements.getElement(CardNumberElement);
            if (!cardElement || !merchantDetailsInfo) {
                setError("Card information or merchant details missing");
                setProcessing(false);
                return;
            }
            handleCustomerCreate(merchantDetailsInfo.customerId);
            setError(null);
        } catch (err) {
            setError("An error occurred. Please try again.");
            setProcessing(false);
        }
    };

    const clearCardElement = () => {
        if (!elements) return;

        const cardElement = elements.getElement(CardNumberElement);
        if (cardElement) {
            // Some elements support a clear method directly
            if (typeof (cardElement as any).clear === "function") {
                (cardElement as any).clear();
            } else {
                // Alternative approach: create a new instance
                elements.update({});

                // Force the input to reset by triggering blur/focus
                cardElement.blur?.();
                setTimeout(() => cardElement.focus?.(), 10);
            }
        }

        // Reset form state if needed
        setError(null);
        setProcessing(false);
    };
    const handleConfirmCardSetup = async (clientSecret: string, customer_id: string) => {
        if (!stripe || !elements) {
            return;
        }
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
            setError("Card element not found");
            setProcessing(false);
            return;
        }
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });
        if (result.error) {
            setError(result.error.message || "An error occurred");
            setProcessing(false);
            const notified = notifyViaPostMessage(
                "failure",
                {
                    error: result.error.message || "An error occurred",
                },
                merchantDetailsInfo!
            );

            // Fallback to URL scheme if postMessage failed
            if (!notified) {
                setTimeout(() => {
                    window.location.href = `posapp://card-saved?status=failure&error=${encodeURIComponent(result.error.message || "An error occurred")}`;
                }, 500);
            }
        } else {
            const paymentMethodId = result.setupIntent.payment_method;

            if (typeof paymentMethodId === "string" && merchantDetailsInfo) {
                // setSucceeded(true);
                setError(null);
                setProcessing(false);
                clearCardElement();
                // Notify via postMessage
                const notified = notifyViaPostMessage(
                    "success",
                    {
                        paymentMethodId,
                    },
                    merchantDetailsInfo
                );

                try {
                    if (paymentMethodId) {
                    setLoading(true);

                        const saveAndPayResponse = await stripeSaveAndPay(
                            paymentMethodId,
                            customer_id,
                            merchantDetailsInfo
                        );

                        if (saveAndPayResponse.success) {

                            setSucceeded(true);
                            handleStripeLog(
                                JSON.stringify({
                                    error: saveAndPayResponse.errorResponse,
                                    payload: merchantDetailsInfo,
                                    saveAndPayResponse: saveAndPayResponse.response,
                                    tokenId: paymentMethodId,
                                    token: paymentMethodId,
                                }),
                                merchantDetailsInfo
                            );
                            notifyViaPostMessage(
                                "success",
                                {
                                    transactionId: saveAndPayResponse.response.transaction.id,
                                },
                                merchantDetailsInfo
                            );
                            setProcessing(false);
                        } else {
                            handleStripeLog(
                                JSON.stringify({
                                    error: saveAndPayResponse.errorResponse,
                                    payload: merchantDetailsInfo,
                                    saveAndPayResponse: saveAndPayResponse.response,
                                    tokenId: paymentMethodId,
                                    token: paymentMethodId,
                                }),
                                merchantDetailsInfo
                            );
                            notifyViaPostMessage(
                                "failure",
                                {
                                    error: saveAndPayResponse.errorResponse,
                                },
                                merchantDetailsInfo
                            );
                        }
                    }
                } catch (error) {
                    handleStripeLog(
                        JSON.stringify({
                            error: error,
                            tokenId: paymentMethodId,
                            token: paymentMethodId,
                            payload: merchantDetailsInfo,
                        }),
                        merchantDetailsInfo
                    );
                    setProcessing(false);
                }

                // Fallback to URL scheme if postMessage failed
                if (!notified) {
                    setTimeout(() => {
                        window.location.href = `posapp://card-saved?status=success&paymentMethodId=${encodeURIComponent(paymentMethodId)}`;
                    }, 500);
                }
            } else {
                setError("Invalid payment method ID or missing merchant details");
                setProcessing(false);
                clearCardElement();
                setTimeout(() => {
                    window.location.href = `${merchantDetailsInfo?.base_url}/cancel`;
                }, 1000);
            }
        }
    };
    const handleSetupIntent = async (customer_id: string) => {
        if (!stripe || !merchantDetailsInfo) {
            return;
        }
        try {
            const response = await fetch(
                `${merchantDetailsInfo.base_url}/stripe/setup-payment-intent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        customer_id,
                    }),
                }
            );
            const { client_secret } = await response.json();
            handleConfirmCardSetup(client_secret, customer_id);
        } catch (error) {
            setError("An error occurred. Please try again.");
            clearCardElement();
            setProcessing(false);
        }
    };
    const handleCustomerCreate = async (customerId: string) => {
        if (!stripe || !merchantDetailsInfo) {
            return;
        }
        const response = await fetch(
            `${merchantDetailsInfo.base_url}/stripe/customer/${customerId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();

        if (error) {
            setError(error);
        } else {
            handleSetupIntent(data.customer_id);
        }
    };
    if (loading) {
        return <Loading />;
    }
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={img} alt="Card icon" className={styles.headerIcon} />
                <h3 className={styles.title}>Save and pay</h3>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.paymentMethodContainer}>
                    <div className={styles.paymentMethodButton}>
                        <CreditCardIcon className={styles.icon} />
                        <span className={styles.text}>Card</span>
                    </div>
                </div>
                <div className={styles.formWrapper}>
                    <div className={styles.content}>
                        <div className={styles.fieldContainer}>
                            <label className={styles.label}>Card Number</label>
                            <div className={styles.cardElement}>
                                <CardNumberElement
                                    options={{
                                        disableLink: true,
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                color: "#1a1a1a",
                                                fontWeight: "400",
                                                "::placeholder": {
                                                    color: "#9ca3af",
                                                },
                                            },
                                            invalid: {
                                                color: "#dc2626",
                                            },
                                        },
                                        placeholder: "1234 5678 9012 3456",
                                    }}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.rowContainer}>
                            <div className={styles.halfWidth}>
                                <label className={styles.label}>Expiry Date</label>
                                <div className={styles.cardElement}>
                                    <CardExpiryElement
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "16px",
                                                    color: "#1a1a1a",
                                                    fontWeight: "400",
                                                    "::placeholder": {
                                                        color: "#9ca3af",
                                                    },
                                                },
                                                invalid: {
                                                    color: "#dc2626",
                                                },
                                            },
                                            placeholder: "MM / YY",
                                        }}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.halfWidth}>
                                <label className={styles.label}>Security Code</label>
                                <div className={styles.cardElement}>
                                    <CardCvcElement
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "16px",
                                                    color: "#1a1a1a",
                                                    fontWeight: "400",
                                                    "::placeholder": {
                                                        color: "#9ca3af",
                                                    },
                                                },
                                                invalid: {
                                                    color: "#dc2626",
                                                },
                                            },
                                            placeholder: "CVC",
                                        }}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

                        <div className={styles.buttonContainer}>
                            <button
                                type="submit"
                                disabled={processing || !stripe || !merchantDetailsInfo}
                                className={`${styles.button} ${(processing || !stripe || !merchantDetailsInfo) ? styles.button_disabled : ''}`}
                                onClick={handleSubmit}
                            >
                                {processing
                                    ? "Processing..."
                                    : `Pay $${merchantDetailsInfo?.amount ? (Number(merchantDetailsInfo.amount) / 100).toFixed(2) : "0.00"} USD`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CardForm;
