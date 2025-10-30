import React, { useState, useEffect, useRef } from "react";
import { PayrixPaymentPageInfo, PayrixLoadingState } from "../../Models/Payrix.modal";
import Loading from "src/Shared/Components/Loading";
import "../../styles/PayrixPayFields.css";
import {
    getPaymentPageInfo,
    makeSaveCardPayment,
    notifyViaPostMessage,
    saveAndPay,
    handleLog,
} from "src/Payrix/services/Payrix.service";
import { useParams } from "react-router-dom";
import PayrixForm from "../PayrixForm/PayrixForm";
import { loadPayrixScripts } from "src/Payrix/utils/scriptLoader";

declare global {
    interface Window {
        PayFields: any;
    }
}

const PayrixSaveAndPay = () => {
    const [paymentInfo, setPaymentInfo] = useState<PayrixPaymentPageInfo | null>(null);
    const [loadingState, setLoadingState] = useState<PayrixLoadingState>({
        isLoading: true,
        loadingMessage: "",
        error: null,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const payFieldsRef = useRef<any>(null);

    // 🔥 ADD PROGRESSIVE LOADING STATES FROM MOBILE PAYMENT
    const [isPayFieldsLoaded, setIsPayFieldsLoaded] = useState(false);
    // const [paymentDataResponse, setPaymentDataResponse] = useState<PayrixSaveCardInfo | null>(null);
    const [isDomReady, setIsDomReady] = useState(false);
    const [areIframesLoaded, setAreIframesLoaded] = useState(false);
    const [showFullLoader, setShowFullLoader] = useState(true);
    const { merchantId, customerId, paymentPageId } = useParams<{
        merchantId: string;
        customerId: string;
        paymentPageId: string;
    }>();

    useEffect(() => {
        initializePayment();
    }, [paymentPageId]);

    // 🔥 ADD PAYFIELDS INITIALIZATION AFTER DOM IS RENDERED
    useEffect(() => {
        if (isDomReady && paymentInfo && window.PayFields) {
            setTimeout(() => {
                initializePayFields(paymentInfo);
            }, 100);
        }
    }, [isDomReady, paymentInfo]);

    // 🔥 ADD IFRAME LOADING MONITORING AFTER PAYFIELDS IS INITIALIZED
    useEffect(() => {
        if (isPayFieldsLoaded) {
            checkIframeLoading();
        }
    }, [isPayFieldsLoaded]);
    const initializePayment = async () => {
        try {
            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });

            // Step 1: Get payment page info
            const paymentData = await getPaymentPageInfo(paymentPageId);
            // setPaymentInfo(paymentData);

            // Step 2: Load scripts
            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });

            await loadPayrixScripts("save-and-pay");

            setLoadingState({
                isLoading: true,
                loadingMessage: "",
                error: null,
            });

            // 🔥 SWITCH TO OVERLAY LOADING AND RENDER DOM (like mobile payment)
            if (paymentData) {
                setPaymentInfo(paymentData);
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

    // 🔥 ADD IFRAME LOADING DETECTION (same as mobile payment)
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

        // 🔥 ADD DOM ELEMENT CHECK BEFORE INITIALIZING (like mobile payment)
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

        // Configure PayFields for card saving
        PayFields.config.apiKey = paymentData?.publishable_key;
        PayFields.config.merchant = paymentData?.account_id;
        PayFields.config.mode = "token";
        PayFields.config.txnType = "auth";

        // 🔥 ADD STYLING CONFIGURATION (like mobile payment)
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
            value: `Pay $${paymentData.amount ? (paymentData.amount / 100).toFixed(2) : "0.00"} USD`,
        };

        PayFields.onSuccess = async (res: any) => {
            setProcessing(true);
            const tokenId = res.data[0]?.id;
            const token = res.data[0]?.token;
            try {
                const saveCardResponse = await makeSaveCardPayment(tokenId, customerId);
                if (saveCardResponse.success) {
                    const saveAndPayResponse = await saveAndPay(token, customerId, paymentData);
                    handleLog(
                        JSON.stringify({
                            error: saveCardResponse.errorResponse,
                            payload: paymentData,
                            saveCardResponse: saveCardResponse.response,
                            tokenId,
                            token,
                        }),
                        paymentData
                    );
                    if (saveAndPayResponse.success) {
                        handleLog(
                            JSON.stringify({
                                error: saveAndPayResponse.errorResponse,
                                payload: paymentData,
                                saveAndPayResponse: saveAndPayResponse.response,
                                tokenId,
                                token,
                            }),
                            paymentData
                        );
                        notifyViaPostMessage(
                            "success",
                            {
                                transactionId: saveAndPayResponse.response.transaction.id,
                            },
                            paymentData
                        );
                    } else {
                        handleLog(
                            JSON.stringify({
                                error: saveAndPayResponse.errorResponse,
                                payload: paymentData,
                                saveAndPayResponse: saveAndPayResponse.response,
                                tokenId,
                                token,
                            }),
                            paymentData
                        );
                        notifyViaPostMessage(
                            "failure",
                            {
                                error: saveAndPayResponse.errorResponse,
                            },
                            paymentData
                        );
                    }
                    setProcessing(false);
                }
            } catch (error) {
                handleLog(
                    JSON.stringify({
                        error: error,
                        tokenId,
                        token,
                        payload: paymentData,
                    }),
                    paymentData
                );
                console.log("error", error);
                setProcessing(false);
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
                }),
                paymentData
            );
        };

        PayFields.onValidationFailure = () => {
            setProcessing(false);
        };

        // 🔥 ENHANCED ONREADY WITH LOADING CLASSES (like mobile payment)
        PayFields.onReady = () => {
            // Add loading class to iframe containers while they initialize
            const containers = ["#ccnumber", "#ccexp", "#cvv"];
            containers.forEach((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.classList.add("loading");
                }
            });

            setTimeout(() => {
                setIsPayFieldsLoaded(true);
                // Remove loading classes once ready
                containers.forEach((selector) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.classList.remove("loading");
                    }
                });
            }, 500);
        };

        // 🔥 ADD FIELD EVENT HANDLERS FOR BETTER UX (like mobile payment)
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

        try {
            console.log("PayFields initializing for card save...");
            PayFields.ready(); // Trigger setup after all handlers are registered
        } catch (err) {
            console.error("❌ PayFields.ready() error", err);
        }
        payFieldsRef.current = PayFields;
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

    const handleSubmit = () => {
        setProcessing(true);
    };

    // 🔥 SHOW FULL-SCREEN LOADER INITIALLY (like mobile payment)
    if (showFullLoader) {
        return (
            <div>
                <Loading />
            </div>
        );
    }

    // 🔥 SHOW ERROR STATE (like mobile payment)
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

    // 🔥 MAIN FORM WITH CONDITIONAL OVERLAY (like mobile payment)
    return (
        <>
            {/* 🔥 LOADING OVERLAY DURING PAYFIELDS AND IFRAME INITIALIZATION */}
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
                    title="Save and Pay"
                    buttonText={`Pay $${paymentInfo ? (paymentInfo.amount / 100).toFixed(2) : "0.00"} USD`}
                    processingText="Saving and Paying..."
                    paymentInfo={paymentInfo}
                    processing={processing}
                    areIframesLoaded={areIframesLoaded}
                    onSubmit={handleSubmit}
                    infoItems={["🔒 All payment methods are secure and encrypted"]}
                    errorMessage={errorMessage ?? ""}
                />
            </div>
        </>
    );
};

export default PayrixSaveAndPay;
