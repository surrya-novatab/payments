import React, { useEffect, useState } from "react";
import "./PaymentElementsForm.scss";
import {
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { Button } from "antd";
import img from "./hold-credit-card.svg";
import { PaymentPageInfoResponse } from "./service/PaymentElementsService";

declare global {
  interface Window {
    NovaPaymentChannel: {
      postMessage(message: string): void;
    };
  }
}

interface PaymentPageFormProps {
  paymentInfo: PaymentPageInfoResponse;
  wallets_only?: boolean;
}

const PaymentPageForm: React.FC<PaymentPageFormProps> = ({
  paymentInfo,
  wallets_only = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  // Track payment form states
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  // Apple Pay state
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // For credit vs. debit detection
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [cardFundingType, setCardFundingType] = useState("");

  // For demonstration: base amount as a float
  const baseAmount = Number(paymentInfo.amount);

  // Surcharge & final amount
  const [surchargeFee, setSurchargeFee] = useState(0);
  const finalAmount = baseAmount + surchargeFee;

  const handleLog = async (payload: string) => {
    await fetch(`${paymentInfo.paymentExternalUrl}/stripe/log`, {
      method: "POST",
      body: JSON.stringify({ payload }),
      headers: {
        "Content-Type": "application/json",
        merchant_id: paymentInfo.merchant_id,
      },
    });
  };
  const notifyViaPostMessage = (status: string, data: any) => {
    try {
      handleLog(
        JSON.stringify({
          message: "Notify Via Post Message",
          status,
          data,
          paymentInfo: paymentInfo.metadata,
        })
      );

      // Try postMessage first
      try {
        handleLog(
          JSON.stringify({
            message: "Success URL 1",
            success_url: paymentInfo.success_url,
            status: status,
          })
        );
        window.NovaPaymentChannel.postMessage(
          JSON.stringify({
            status,
            ...data,
          })
        );

        if (status === "success" && paymentInfo.success_url) {
          handleLog(
            JSON.stringify({
              message: "Success URL 2",
              success_url: paymentInfo.success_url,
              status: status,
            })
          );
          setTimeout(() => {
            window.location.href = paymentInfo.success_url;
          }, 500);
        }
        if (status === "cancel") {
          window.history.back();
        }
        return true;
      } catch (postError) {
        handleLog(
          JSON.stringify({
            message: "PostMessage failed",
            error: postError,
            status: status,
          })
        );
        console.error("PostMessage failed:", postError);
      }

      // Fallback to URL scheme
      if (status === "success") {
        setTimeout(() => {
          window.location.href = `posapp://payment-completed?status=success&transactionId=${encodeURIComponent(
            data.transactionId || ""
          )}&paymentIntentId=${encodeURIComponent(data.paymentIntentId || "")}`;
        }, 500);
      } else if (status === "failure") {
        setTimeout(() => {
          window.location.href = `posapp://payment-completed?status=failure&error=${encodeURIComponent(
            data.error || "An error occurred"
          )}`;
        }, 500);
      }
      return true;
    } catch (e) {
      handleLog(
        JSON.stringify({
          status,
          data,
          error: e,
          paymentInfo: paymentInfo.metadata,
        })
      );
      return false;
    }
  };

  /**
   * Process payment - common function for both Apple Pay and card form
   */
  const processPayment = async (isApplePay: boolean) => {
    if (!stripe) return { success: false, error: "Stripe is not available" };

    setProcessing(true);
    setError(null);

    try {
      // 1. Resuse the Already Created payment intent
      // 2. Confirm paymentat sdk level
      let confirmError;
      if (!isApplePay) {
        if (elements) {
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: paymentInfo.success_url,
              payment_method_data: {
                billing_details: {
                  name: "Card Manual Key In - Using Payment Elements",
                },
              },
            },
            redirect: "if_required",
          });
          confirmError = error;
        }
      }
      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed");
        handleLog(
          JSON.stringify({
            error: confirmError,
            message: confirmError.message || "Payment confirmation failed",
            function: "processPayment.confirmPayment",
            paymentInfo: paymentInfo.metadata,
          })
        );
        // throw new Error(confirmError.message || "Payment confirmation failed");
        notifyViaPostMessage("failure", {
          error: confirmError.message || "An error occurred",
          transactionId: paymentInfo.transactionId,
          paymentIntentId: paymentInfo.paymentIntentId,
        });
        return;
      } else {
        if (!isApplePay) {
          handleLog(
            JSON.stringify({
              message: "Payment confirmed successfully at SDK",
              function: "processPayment.confirmPayment",
              paymentInfo: paymentInfo.metadata,
            })
          );
        }
      }
      // 3. Confirm transaction on backend
      await fetch(
        `${paymentInfo.paymentExternalUrl}/transaction/${paymentInfo.transactionId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            merchant_id: paymentInfo.merchant_id,
          },
        }
      );
      // 4. Update payment page status
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
      // 5. Redirect to success page
      notifyViaPostMessage("success", {
        status: "success",
        transactionId: paymentInfo.transactionId,
        paymentIntentId: paymentInfo.paymentIntentId,
      });
      handleClear();
    } catch (err: any) {
      setError(err.message || "Payment failed");
      handleLog(
        JSON.stringify({
          error: err,
          message: err.message || "Payment failed",
          function: "processPayment",
          paymentInfo: paymentInfo.metadata,
        })
      );
      notifyViaPostMessage("failure", {
        error: err.message || "An error occurred",
      });
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  // Set up Apple Pay when Stripe is available
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: paymentInfo.currency.toLowerCase(),
        total: {
          label: "Payment",
          amount: Math.round(finalAmount),
        },
        requestPayerName: true,
        requestPayerEmail: false,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          handleLog(
            JSON.stringify({
              message: "Apple Pay is supported",
              function: "canMakePayment",
              paymentInfo: paymentInfo.metadata,
            })
          );
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on("cancel", () => {
        setProcessing(false);
      });

      // Handle payment method
      pr.on("paymentmethod", async (e) => {
        handleLog(
          JSON.stringify({
            message: "Making Payment with Apple Pay",
            function: "paymentmethod",
            paymentInfo: paymentInfo.metadata,
          })
        );
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          paymentInfo.client_secret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        );
        if (error) {
          setError(error.message || "Payment confirmation failed");
          handleLog(
            JSON.stringify({
              error: error,
              message: error.message || "Payment confirmation failed",
              function: "paymentmethod.confirmCardPayment",
              paymentInfo: paymentInfo.metadata,
              type: "Apple Payment failed",
              paymentIntent: JSON.stringify(paymentIntent),
            })
          );
          e.complete("fail");
          notifyViaPostMessage("failure", {
            error: error.message || "An error occurred",
          });
          return;
        } else {
          handleLog(
            JSON.stringify({
              message: "Apple Pay payment confirmed successfully",
              function: "paymentmethod.confirmCardPayment",
              paymentInfo: paymentInfo.metadata,
            })
          );
          e.complete("success");
        }
        setTimeout(async () => {
          try {
            // Confirm transaction on backend
            await fetch(
              `${paymentInfo.paymentExternalUrl}/transaction/${paymentInfo.transactionId}/confirm`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  merchant_id: paymentInfo.merchant_id,
                },
              }
            );
            // Update payment page status
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

            // Notify success and redirect
            const notified = notifyViaPostMessage("success", {
              status: "success",
              transactionId: paymentInfo.transactionId,
              paymentIntentId: paymentInfo.paymentIntentId,
            });

            if (!notified) {
              // Fallback to URL scheme
              window.location.href = `posapp://payment-completed?status=success&transactionId=${encodeURIComponent(
                paymentInfo.transactionId
              )}&paymentIntentId=${encodeURIComponent(
                paymentInfo.paymentIntentId
              )}`;
            }
          } catch (processError: any) {
            setError(processError.message || "Payment processing failed");
            handleLog(
              JSON.stringify({
                error: processError,
                message: "Error in backend processing after Apple Pay",
                function: "paymentmethod.processPayment",
                paymentInfo: paymentInfo.metadata,
              })
            );
            const notified = notifyViaPostMessage("failure", {
              status: "failure",
              error: processError.message || "Payment processing failed",
            });

            if (!notified) {
              // Fallback to URL scheme
              window.location.href = `posapp://payment-completed?status=failure&error=${encodeURIComponent(
                processError.message || "Payment processing failed"
              )}`;
            }
          }
        }, 1000); // 1 second delay
      });
    }
  }, [stripe, paymentInfo, finalAmount, isCreditCard, surchargeFee]);

  const handleClear = () => {
    if (elements) {
      // Get the PaymentElement instance
      const paymentElement = elements.getElement(PaymentElement);

      // Clear the payment element if it exists
      if (paymentElement) {
        (paymentElement as any).clear();
      }

      // Reset state
      setPaymentReady(false);
      setError(null);
      setIsCreditCard(false);
      setSurchargeFee(0);
      setCardFundingType("");
    }
  };
  const handleCancel = () => {
    // Handle cancel action
    handleClear();
    const notified = notifyViaPostMessage("cancel", {
      paymentIntentId: paymentInfo.paymentIntentId,
      transactionId: paymentInfo.transactionId,
    });
  };
  // Handle change events from the PaymentElement
  const handlePaymentElementChange = async (event: any) => {
    if (!stripe) return;
    setPaymentReady(event.complete);
    setError(event.error ? event.error.message : null);
  };

  /**
   * Submits the form
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Use the common processPayment function
    await processPayment(false);
  };

  // Check if Cancel button should be shown (hide for TakeAway.App)
  const shouldShowCancelButton =
    paymentInfo.metadata?.applicationName !== "TakeAway.App";

  return (
    <div className="payment-card-container">
      <div className="card-container">
        <div className="card-header">
          <div className="d-flex align-items-center">
            <img src={img} alt="Card icon" className="mr-2" />
            <h3 className="card-title">Payment</h3>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          id="payment-form"
          className="payment-form"
        >
          {wallets_only ? (
            // Only render Apple Pay button when walletsOnly is true
            canMakePayment &&
            paymentRequest && (
              <div className="apple-pay-section mb-4">
                <label className="label-text mb-2">Quick Checkout</label>
                <PaymentRequestButtonElement
                  onClick={() => setProcessing(true)}
                  options={{
                    paymentRequest,
                    style: {
                      paymentRequestButton: {
                        type: "buy",
                        theme: "dark",
                        height: "40px",
                      },
                    },
                  }}
                />
              </div>
            )
          ) : (
            // Render the full payment form when walletsOnly is false
            <>
              {/* Payment Element */}
              <div className="form-group">
                <label className="label-text mb-2">Card Details</label>
                <div className="payment-element-container">
                  <PaymentElement
                    onChange={handlePaymentElementChange}
                    options={{
                      layout: "tabs",
                      fields: {
                        billingDetails: {
                          name: "never",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div id="card-errors" className="text-red-600 mt-3">
                  {error}
                </div>
              )}

              {/* Surcharge notice for credit cards */}
              {isCreditCard && surchargeFee > 0 && (
                <div
                  id="surcharge-consent"
                  className="surcharge-notice text-blue-700 text-sm mt-3 flex items-center gap-2"
                >
                  <span>ⓘ </span>
                  <span>
                    You will be assessed a surcharge amount for using credit
                    card
                  </span>
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="button-container mt-4">
            {shouldShowCancelButton && (
              <Button
                className="custom-cancel"
                disabled={processing}
                onClick={() => handleCancel()}
              >
                Cancel
              </Button>
            )}
            {!wallets_only && (
              <Button
                className="custom-pay"
                htmlType="submit"
                disabled={processing || !paymentReady}
              >
                {processing
                  ? "Processing..."
                  : `Pay ${(finalAmount / 100).toFixed(
                      2
                    )} ${paymentInfo.currency.toUpperCase()}`}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPageForm;
