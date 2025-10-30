import React from "react";
import type { PayrixPaymentPageInfo } from "src/Payrix/Models/Payrix.modal";
import "./PayrixForm.css";
declare global {
    interface IntrinsicElements {
        "apple-pay-button": {
            buttonstyle?: string;
            type?: string;
            locale?: string;
        };
    }
}

interface PayrixFormProps {
    title: string;
    buttonText: string;
    processingText?: string;
    paymentInfo: PayrixPaymentPageInfo | null;
    processing: boolean;
    areIframesLoaded: boolean;
    showGooglePay?: boolean;
    showApplePay?: boolean;
    googlePayReady?: boolean;
    onSubmit: () => void;
    infoItems?: string[];
    showCardForm?: boolean;
    isLoading?: boolean;
    errorMessage?: string;
}

const PayrixForm: React.FC<PayrixFormProps> = ({
    title,
    buttonText,
    processingText = "Processing...",
    paymentInfo,
    processing,
    areIframesLoaded,
    showGooglePay = false,
    showApplePay = false,
    googlePayReady = false,
    onSubmit,
    infoItems = [],
    showCardForm = true,
    isLoading,
    errorMessage,
}) => {
    return (
        <div className="checkout-container" style={{ position: "relative" }}>
            <div
                className={`checkout-wrapper mobile-payment ${areIframesLoaded && !isLoading ? "content-visible" : "content-hidden"}`}
            >
                <div className="checkout-card">
                    <h2 className="checkout-title">{title}</h2>

                    {/* Wallet Section - Conditionally rendered */}
                    {(showGooglePay || showApplePay) && (
                        <div className="wallet-payment-section">
                            {showGooglePay && (
                                <div
                                    className={`google-pay-button-container ${areIframesLoaded && !isLoading ? "wallet-visible" : "wallet-hidden"}`}
                                >
                                    <div id="googlePayButton"></div>
                                </div>
                            )}
                            {showApplePay && (
                                <div
                                    className={`apple-pay-button-container ${areIframesLoaded && !isLoading ? "wallet-visible" : "wallet-hidden"}`}
                                >
                                    <apple-pay-button
                                        buttonstyle="black"
                                        type="plain"
                                        locale="en"
                                    ></apple-pay-button>
                                </div>
                            )}

                            {(showGooglePay || showApplePay) && showCardForm && (
                                <div
                                    className="payment-divider"
                                    style={{ display: showGooglePay ? "flex" : "none" }}
                                >
                                    <span>or pay with card</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Card Payment Form - Same structure for all */}
                    {/* {showCardForm && ( */}
                    <div
                        className="card-payment-form"
                        style={{ display: showCardForm ? "block" : "none" }}
                    >
                        <div className="">
                            <label>CARD NUMBER</label>
                            <div id="ccnumber" />
                        </div>

                        <div className="form-horizontal">
                            <div>
                                <label>MM/YY</label>
                                <div id="ccexp" />
                            </div>
                            <div>
                                <label>CVV</label>
                                <div id="cvv" />
                            </div>
                        </div>
                        <div>
                            <label>ZIP CODE</label>
                            <div id="address"></div>
                        </div>

                        <div
                            id="submit"
                            className={`submit-button ${processing ? "processing" : ""}`}
                            onClick={processing ? undefined : onSubmit}
                            style={{
                                pointerEvents: areIframesLoaded && !processing ? "auto" : "none",
                                cursor: processing ? "not-allowed" : "pointer",
                            }}
                        >
                            {processing ? processingText : buttonText}
                        </div>
                    </div>
                    {/* )} */}

                    <div className="error">{errorMessage}</div>

                    {/* Info Section - Conditionally rendered */}
                    {infoItems.length > 0 && (
                        <div className="mobile-payment-info">
                            {infoItems.map((item, index) => (
                                <p key={index}>{item}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrixForm;
