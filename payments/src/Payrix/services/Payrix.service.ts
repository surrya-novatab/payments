import { HttpMethod, HttpParameterSubRoute, request } from "../../Commons/Http";
import type { PayrixPaymentPageInfo, PayrixApiResponse } from "../Models/Payrix.modal";

declare global {
    interface Window {
        NovaPaymentChannel : {
            postMessage: (message: string) => void;
        };
    }
}

/**
 * Get payment page information by ID and type
 */
export const getPaymentPageInfo = async (paymentPageId: string): Promise<PayrixPaymentPageInfo> => {
    try {
        const result = await request({
            endPoint: `payrix/payment-page/${paymentPageId}`,
            method: HttpMethod.GET,
            subRoute: HttpParameterSubRoute.paymentsMicroService,
        });

        if (result.success) {
            return result.response;
        } else {
            throw new Error(result.errorMessage || "Failed to fetch payment page info");
        }
    } catch (error) {
        console.error("PayRix Service Error:", error);
        // Return mock data for development
        // return getMockPaymentData(paymentPageId);
    }
};

export const getSavePaymentPageInfo = async (merchantId?: string) => {
    const result = await request({
        endPoint: `merchant/${merchantId}/config`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
    });
    console.log("result", result);
    return result.response;
};

export const updatePaymentPageStatus = async (
    token: string,
    paymentPageId: string
): Promise<PayrixApiResponse> => {
    try {
        const result = await request({
            endPoint: `payrix/payment-page/${paymentPageId}/status`,
            method: HttpMethod.PATCH,
            subRoute: HttpParameterSubRoute.paymentsMicroService,
            body: {
                token: token,
            },
        });

        return {
            success: result.success,
            data: result.response,
            error: result.success ? undefined : result.errorMessage,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Status update failed",
        };
    }
};

/**
 * Log PayRix events for debugging
 */
export const logEvent = async (
    eventType: string,
    payload: any,
    merchantId: string
): Promise<void> => {
    try {
        await request({
            endPoint: "payrix/log",
            method: HttpMethod.POST,
            subRoute: HttpParameterSubRoute.paymentsMicroService,
            body: {
                event_type: eventType,
                payload: JSON.stringify(payload),
                merchant_id: merchantId,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("PayRix logging failed:", error);
    }
};

export const makePayment = async (paymentInfo: PayrixPaymentPageInfo, transactionId: string) => {
    const formattedPaymentInfo = {
        amount: paymentInfo.amount.toString(),
        currency: paymentInfo.currency.toLowerCase(),
        amount_details: paymentInfo.amount_details,
        metadata: paymentInfo.metadata,
        payment_channel: "Card",
        gateway_transaction_id: transactionId,
        deviceid: "RMS",
        provider: "payrix",
        payment_mode: paymentInfo.payment_mode || "Keyed",
    };
    const result = await request({
        endPoint: "payrix/init-payment",
        method: HttpMethod.POST,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
        body: formattedPaymentInfo,
        headers: [
            {
                key: "Content-Type",
                value: "application/json",
            },
            {
                key: "merchant_id",
                value: paymentInfo.merchant_id,
            },
            {
                key: "deviceid",
                value: "RMS",
            }
        ],
    });
    return result;
};

export const makeSaveCardPayment = async (token: string, customerId: string) => {
    const result = await request({
        endPoint: `payrix/payment-method/${token}/${customerId}`,
        method: HttpMethod.POST,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
    });

    console.log("result", result, "respos", result.response);

    return result;
};

export const saveAndPay = async (
    token: string,
    customerId: string,
    paymentInfo: PayrixPaymentPageInfo
) => {
    console.log("paymentInfo", paymentInfo);
    console.log("customerId", customerId);
    const formattedPaymentInfo = {
        amount: paymentInfo.amount.toString(),
        currency: paymentInfo.currency.toLowerCase(),
        customer_id: customerId,
        token: token,
        metadata: paymentInfo.metadata,
        payment_channel: "Card",
        deviceid: "RMS",
        payment_mode:"Keyed",
    };
    const result = await request({
        endPoint: `payrix/online/pay`,
        method: HttpMethod.POST,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
        headers: [
            {
                key: "Content-Type",
                value: "application/json",
            },
            {
                key: "merchant_id",
                value: paymentInfo.merchant_id,
            },
            {
                key: "deviceid",
                value: "RMS",
            }
        ],
        body: formattedPaymentInfo,
    });
    return result;
};


export const handleLog = async (payload: string,paymentInfo: PayrixPaymentPageInfo) => {
        
    await fetch(`${paymentInfo?.paymentExternalUrl}/payrix/log`, {
        method: "POST",
        body: JSON.stringify({ payload }),
        headers: {
            "Content-Type": "application/json",
            merchant_id: paymentInfo?.merchant_id || "",
        },
    });
};

export const notifyViaPostMessage = (status: string, data: Record<string, any>,paymentInfo: PayrixPaymentPageInfo) => {
    try {
        handleLog(JSON.stringify({
            status,
            data,
        }),paymentInfo);
        try {            // Send message to parent (Flutter WebView)
            if (window.NovaPaymentChannel) {
                window.NovaPaymentChannel.postMessage(
                    JSON.stringify({
                        status,
                        ...data,
                    }),
                );
                return true;
            }
        } catch (e) {
            console.error('Error using postMessage:', e,data);
        }
        if (status === "success" && paymentInfo?.success_url ) {
            window.location.href = paymentInfo?.success_url || "";
        }
        else if (status === "failure" && paymentInfo?.cancel_url) {
            window.location.href = paymentInfo?.cancel_url || "";
        }
        if (status === "cancel") {
            window.history.back();
        }
        return true;
    } catch (e) {
        handleLog(
            JSON.stringify({
                status,
                data,
                error: e,
                paymentInfo: paymentInfo?.metadata,
            }),paymentInfo
        );
        return false;
    }
};
