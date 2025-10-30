import React, { useState } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import img from "../CardManual/hold-credit-card.svg";
import { IMerchantDetails } from "./service/SavedCardService";
import styles from "./CardForm.module.scss";
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
    const stripe = useStripe();
    const elements = useElements();

    const handleChange = (event: { error?: { type: string; code: string; message: string } }) => {
        setError(event.error ? event.error.message : null);
    };

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setProcessing(true);
        try {
            if (!stripe || !elements) {
                // Stripe.js has not loaded yet
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

    const notifyViaPostMessage = (status: string, data: any) => {
        try {
            // Send message to parent (Flutter WebView)
            if (window.NovaSaveCardChannel) {
                window.NovaSaveCardChannel.postMessage(
                    JSON.stringify({
                        status,
                        data,
                    })
                );
                return true;
            }
        } catch (e) {
            console.error("Error using postMessage:", e);
            return false;
        }
    };
    const clearCardElement = () => {
        if (!elements) return;

        const cardNumberElement = elements.getElement(CardNumberElement);
        const cardExpiryElement = elements.getElement(CardExpiryElement);
        const cardCvcElement = elements.getElement(CardCvcElement);

        [cardNumberElement, cardExpiryElement, cardCvcElement].forEach(element => {
            if (element) {
                // Some elements support a clear method directly
                if (typeof (element as any).clear === "function") {
                    (element as any).clear();
                } else {
                    // Alternative approach: create a new instance
                    elements.update({});

                    // Force the input to reset by triggering blur/focus
                    element.blur?.();
                    setTimeout(() => element.focus?.(), 10);
                }
            }
        });

        // Reset form state if needed
        setError(null);
        setProcessing(false);
    };
    const handleConfirmCardSetup = async (clientSecret: string) => {
        if (!stripe || !elements) {
            return;
        }
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            setError("Card element not found");
            setProcessing(false);
            return;
        }
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
                card: cardNumberElement,
            },
        });
        if (result.error) {
            setError(result.error.message || "An error occurred");
            setProcessing(false);
            const notified = notifyViaPostMessage("failure", {
                error: result.error.message || "An error occurred",
            });

            // Fallback to URL scheme if postMessage failed
            if (!notified) {
                setTimeout(() => {
                    window.location.href = `posapp://card-saved?status=failure&error=${encodeURIComponent(result.error.message || "An error occurred")}`;
                }, 500);
            }
        } else {
            const paymentMethodId = result.setupIntent.payment_method;

            if (typeof paymentMethodId === "string" && merchantDetailsInfo) {
                setSucceeded(true);
                setError(null);
                setProcessing(false);
                clearCardElement();
                // Notify via postMessage
                const notified = notifyViaPostMessage("success", {
                    paymentMethodId,
                });

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
            handleConfirmCardSetup(client_secret);
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
            console.log("Customer data:", data);
            handleSetupIntent(data.customer_id);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={img} alt="Card icon" className={styles.headerIcon} />
                <h3 className={styles.title}>Add Card</h3>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.paymentMethodContainer}>
                    <div className={styles.paymentMethodButton}>
                        <CreditCardIcon className={styles.icon} />
                        <span className={styles.text}>Card</span>
                    </div>
                </div>
                <div className={styles.formWrapper}>
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
                    {succeeded && (
                        <div className={`${styles.message} ${styles.success}`}>
                            Card saved successfully!
                        </div>
                    )}

                    <div className={styles.buttonContainer}>
                        <button
                            type="submit"
                            disabled={processing || !stripe || !merchantDetailsInfo}
                            className={`${styles.button} ${(processing || !stripe || !merchantDetailsInfo) ? styles.button_disabled : ''}`}
                            onClick={handleSubmit}
                        >
                            {processing ? "Processing..." : "Save Card"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CardForm;
