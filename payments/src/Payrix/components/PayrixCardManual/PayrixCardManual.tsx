import React, { useState, useEffect } from "react";
import type { PayrixPaymentPageInfo, PayrixLoadingState } from "../../Models/Payrix.modal";
import {
    getPaymentPageInfo,
    handleLog,
    makePayment,
    notifyViaPostMessage,
} from "../../services/Payrix.service";
import Loading from "../../../Shared/Components/Loading";
import "../../styles/PayrixPayFields.css";
import { useParams } from "react-router-dom";
import PayrixForm from "../PayrixForm/PayrixForm";
import { loadPayrixScripts } from "../../../Payrix/utils/scriptLoader";

declare global {
    interface Window {
        PayFields: any;
        google: any;
        ApplePaySession: any;
    }
}
const PayrixCardManual: React.FC = () => {
    
  

    const [paymentInfo, setPaymentInfo] = useState<PayrixPaymentPageInfo | null>(null);
    const [loadingState, setLoadingState] = useState<PayrixLoadingState>({
        isLoading: true,
        loadingMessage: "",
        error: null,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const { paymentPageId } = useParams<{ paymentPageId: string }>();
    const [isPayFieldsLoaded, setIsPayFieldsLoaded] = useState(false);
    const [paymentDataResponse, setPaymentDataResponse] = useState<PayrixPaymentPageInfo | null>(
        null
    );
    const [isDomReady, setIsDomReady] = useState(false);
    const [areIframesLoaded, setAreIframesLoaded] = useState(false);
    const [showFullLoader, setShowFullLoader] = useState(true);
    useEffect(() => {
        initializePayment();
    }, [paymentPageId]);

    const initializePayment = async () => {
        try {
            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });

            // Step 1: Get payment page info
            const paymentDataResponse = await getPaymentPageInfo(paymentPageId);
            setPaymentInfo(paymentDataResponse);
            // Step 2: Load scripts
            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });
            await loadPayrixScripts("card-manual");

            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });

            if (paymentDataResponse) {
                setPaymentDataResponse(paymentDataResponse);
                // Switch to overlay loading and render DOM
                setShowFullLoader(false);
                setIsDomReady(true);
            }
        } catch (error) {
            setLoadingState({
                isLoading: false,
                loadingMessage: "",
                error: error instanceof Error ? error.message : "Failed to initialize payment",
            });
            setShowFullLoader(false);
        }
    };

    // Initialize PayFields after DOM is rendered
    useEffect(() => {
        if (isDomReady && paymentDataResponse && window.PayFields) {
            setTimeout(() => {
                initializePayFields(paymentDataResponse);
            }, 100);
        }
    }, [isDomReady, paymentDataResponse]);

    // Monitor iframe loading after PayFields is initialized
    useEffect(() => {
        if (isPayFieldsLoaded) {
            checkIframeLoading();
        }
    }, [isPayFieldsLoaded]);
    const checkIframeLoading = () => {
        setLoadingState({
            isLoading: true,
            loadingMessage: "",
            error: null,
        });

        const checkInterval = setInterval(() => {
            const ccnumberIframe = document.querySelector("#ccnumber iframe");
            const cvvIframe = document.querySelector("#cvv iframe");
            const ccexpIframe = document.querySelector("#ccexp iframe");

            const iframesExist = ccnumberIframe && cvvIframe && ccexpIframe;

            if (iframesExist) {
                // Check if iframes have loaded content
                let allIframesReady = true;

                [ccnumberIframe, cvvIframe, ccexpIframe].forEach((iframe: any) => {
                    try {
                        // For cross-origin iframes, we can't access contentDocument
                        // So we check if iframe has proper dimensions and is visible
                        const rect = iframe.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) {
                            allIframesReady = false;
                        }
                    } catch (e) {
                        // Cross-origin access denied, assume it's loaded if it exists
                    }
                });

                if (allIframesReady) {
                    clearInterval(checkInterval);
                    // Add a small delay to ensure visual stability
                    setTimeout(() => {
                        setAreIframesLoaded(true);
                        setLoadingState({
                            isLoading: false,
                            loadingMessage: "",
                            error: null,
                        });
                    }, 500);
                }
            }
        }, 200);

        // Timeout fallback - force complete after 8 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!areIframesLoaded) {
                setAreIframesLoaded(true);
                setLoadingState({
                    isLoading: false,
                    loadingMessage: "",
                    error: null,
                });
            }
        }, 8000);
    };
    const initializePayFields = (paymentData: PayrixPaymentPageInfo) => {
        if (!window.PayFields) return;

        // Check if DOM elements exist before initializing - INCLUDE google-pay-button
        const requiredElements = ["#ccnumber", "#cvv", "#ccexp", "#submit"];
        const elementsExist = requiredElements.every((selector) =>
            document.querySelector(selector)
        );

        if (!elementsExist) {
            console.warn("Required DOM elements not found, retrying...");
            setTimeout(() => initializePayFields(paymentData), 200);
            return;
        }

        const PayFields = window.PayFields;
        // Configure PayFields for mobile payment
        PayFields.config.apiKey = paymentData?.publishable_key;
        PayFields.config.merchant = paymentData.account_id;
        PayFields.config.amount = paymentData.amount;
        PayFields.config.mode = "txnToken";
        PayFields.config.txnType = "auth";

        // Styling configuration for PayFields
        PayFields.config.style = {
            base: {
                fontSize: "16px",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: "#333",
                padding: "12px",
                "::placeholder": {
                    color: "#999",
                },
            },
            invalid: {
                color: "#e74c3c",
            },
            valid: {
                color: "#27ae60",
            },
        };
        PayFields.config.standAloneZip = true;
        PayFields.customizations.placeholders = {
            "#zip": "10001",
        };
        PayFields.customizations.optionalFields = [
            "#address1",
            "#city",
            "#state",
            "#email",
            "#phone",
        ];

        PayFields.fields = [
            { type: "number", element: "#ccnumber" },
            { type: "cvv", element: "#cvv" },
            { type: "expiration", element: "#ccexp" },
            { type: "address", element: "#address" },
        ];

        PayFields.button = {
            element: "#submit",
            value: `Pay $${(paymentData.amount / 100).toFixed(2)} USD`,
        };
        PayFields.onSuccess = async (res: any) => {
            setProcessing(true);
            const transactionId = res.data[0]?.id;
            try {
                const paymentResponse = await makePayment(paymentData, transactionId);
                if (paymentResponse.success) {
                    handleLog(
                        JSON.stringify({
                            error: paymentResponse.errorResponse,
                            paymentResponse: paymentResponse,
                            transactionId,
                            paymentData: paymentData.id,
                            payload: paymentData,
                        }),
                        paymentData
                    );
                    await fetch(
                        `${paymentData.paymentExternalUrl}/payrix/payment-page/${paymentData.id}`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                merchant_id: paymentData.merchant_id,
                            },
                        }
                    );
                    handleLog(
                        JSON.stringify({
                            error: paymentResponse.errorResponse,
                            paymentResponse: paymentResponse,
                            transactionId,
                            paymentData: paymentData.id,
                            payload: paymentData,
                        }),
                        paymentData
                    );
                    setProcessing(false);
                    notifyViaPostMessage(
                        "success",
                        {
                            transactionId: paymentResponse.response.transaction_id,
                            paymentIntentId: paymentData.paymentIntentId,
                            paymentMethod: res.paymentMethod || "card",
                        },
                        paymentData
                    );
                } else {
                    setProcessing(false);
                    await handleLog(
                        JSON.stringify({
                            error: paymentResponse.errorResponse,
                            paymentResponse: paymentResponse,
                            transactionId,
                            paymentData: paymentData.id,
                            payload: paymentData,
                            timestamp: new Date().toISOString(),
                        }),
                        paymentData
                    );
                    notifyViaPostMessage(
                        "failure",
                        {
                            error: paymentResponse.errorResponse,
                        },
                        paymentData
                    );
                }
            } catch (error) {
                setProcessing(false);
                await handleLog(
                    JSON.stringify({
                        error: error,
                        details: error instanceof Error ? error.message : "Unknown error",
                        transactionId,
                        paymentData: paymentData.id,
                        payload: paymentData,
                    }),
                    paymentData
                );
                notifyViaPostMessage(
                    "failure",
                    {
                        error: error,
                    },
                    paymentData
                );
            }
        };

        PayFields.onFailure = async (res: any) => {
            setErrorMessage(res.errors[0].msg ?? "Something went wrong");
            setProcessing(false);
            handleLog(
                JSON.stringify({
                    error: res.error,
                    response: res,
                    payload: paymentData,
                    timestamp: new Date().toISOString(),
                }),
                paymentData
            );
        };

        PayFields.onValidationFailure = () => {
            setProcessing(false);
        };

        PayFields.onReady = () => {
            const containers = ["#ccnumber", "#ccexp", "#cvv"];
            containers.forEach((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.classList.add("loading");
                }
            });

            setTimeout(() => {
                setIsPayFieldsLoaded(true);
                containers.forEach((selector) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.classList.remove("loading");
                    }
                });
            }, 500);
        };

        // Add event listeners for better UX
        if (PayFields.onFieldEvent) {
            PayFields.onFieldEvent = (field: string, event: string, data: any) => {
                const element = document.querySelector(`#${field}`);
                if (element) {
                    switch (event) {
                        case "focus":
                            element.classList.add("focused");
                            break;
                        case "blur":
                            element.classList.remove("focused");
                            break;
                        case "change":
                            if (data?.valid) {
                                element.classList.remove("error");
                                element.classList.add("valid");
                            } else {
                                element.classList.remove("valid");
                                if (data?.touched) {
                                    element.classList.add("error");
                                }
                            }
                            break;
                    }
                }
            };
        }

        // Initialize PayFields - this should create the Google Pay button automatically
        PayFields.ready();
    };
    useEffect(() => {
        const checkReady = () => {
            if (window.PayFields?.onReady) {
                window.PayFields.onReady(() => {
                    console.log("✅ PayFields iframe is loaded");
                });
            } else {
                console.warn("⏳ PayFields.onReady is not yet available");
            }
        };

        const interval = setInterval(() => {
            if (window.PayFields?.onReady) {
                checkReady();
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);
    const handleCardPayment = () => {
        setProcessing(true);
    };
    // Show full-screen loader initially
    if (showFullLoader) {
        return (
            <div>
                <Loading />
            </div>
        );
    }

    // Show error state
    if (loadingState.error) {
        return (
            <div className="payrix-error">
                <div className="error-message">
                    <h3>Payment Error</h3>
                    <p>{loadingState.error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    // Main payment form with conditional overlay
    return (
        <>
            {/* Loading overlay */}
            {(loadingState.isLoading || !areIframesLoaded) && (
                <div>
                    <Loading />
                </div>
            )}
            <div
                style={{
                    visibility: loadingState.isLoading || !areIframesLoaded ? "hidden" : "visible",
                }}
            >
                <PayrixForm
                    title="Enter Card Details"
                    buttonText={`Pay $${paymentInfo ? (paymentInfo.amount / 100).toFixed(2) : "0.00"} USD`}
                    processingText="Processing..."
                    paymentInfo={paymentInfo}
                    processing={processing}
                    areIframesLoaded={areIframesLoaded}
                    onSubmit={handleCardPayment}
                    infoItems={["🔒 All payment methods are secure and encrypted"]}
                    errorMessage={errorMessage ?? ""}
                />
            </div>
        </>
    );
};

export default PayrixCardManual;
