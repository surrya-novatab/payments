import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
import { PayrixPaymentPageInfo } from "src/Payrix/Models/Payrix.modal";
export interface IMerchantDetails {
    publishable_key: string;
    account_id: string;
    base_url: string;
    merchantId: string;
    customerId: string;
    amount?: string | number;
    currency: string;
    metadata?: {
        orderId: string;
        orderRefId: string;
        splitRefId: string | null;
        posSessionRefId: string;
        deviceId: string;
        employeeRefId: string;
        employeeName: string;
    };
    success_url?: string;
    cancel_url?: string;
}
export interface IStripeDetails {
    publishable_key: string;
    account_id: string;
    base_url: string;
}
export const getStripeDetailsByMerchantID = async (merchantId: string) => {
    const result = await request({
        endPoint: `merchant/${merchantId}/config`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
    });
    return result.response;
};
export const getStripePaymentPageInfo = async (
    paymentPageId: string
): Promise<PayrixPaymentPageInfo> => {
    try {
        const result = await request({
            endPoint: `stripe/payment-page/${paymentPageId}`,
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
export const stripeSaveAndPay = async (
    token: string,
    customerId: string,
    paymentInfo: IMerchantDetails
) => {
    const formattedPaymentInfo = {
        amount: paymentInfo.amount,
        currency: paymentInfo.currency.toLowerCase(),
        customer_id: customerId,
        token: token,
        metadata: paymentInfo.metadata,
        payment_channel: "Card",
        deviceid: "RMS",
        payment_mode: "Keyed",
    };
    const result = await request({
        endPoint: `stripe/online/pay`,
        method: HttpMethod.POST,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
        headers: [
            {
                key: "Content-Type",
                value: "application/json",
            },
            {
                key: "merchant_id",
                value: paymentInfo.merchantId,
            },
            {
                key: "deviceid",
                value: "RMS",
            },
        ],
        body: formattedPaymentInfo,
    });
    return result;
};
export const handleStripeLog = async (payload: string, paymentInfo: IMerchantDetails) => {
    await fetch(`${paymentInfo?.base_url}/stripe/log`, {
        method: "POST",
        body: JSON.stringify({ payload }),
        headers: {
            "Content-Type": "application/json",
            merchant_id: paymentInfo?.merchantId || "",
        },
    });
};

export const notifyViaPostMessage = (
    status: string,
    data: Record<string, any>,
    paymentInfo: IMerchantDetails
) => {
    try {
        handleStripeLog(
            JSON.stringify({
                status,
                data,
            }),
            paymentInfo
        );
        try {
            // Send message to parent (Flutter WebView)
            if (window.NovaPaymentChannel) {
                window.NovaPaymentChannel.postMessage(
                    JSON.stringify({
                        status,
                        ...data,
                    })
                );
                return true;
            }
        } catch (e) {
            console.error("Error using postMessage:", e, data);
        }
        if (status === "success" && paymentInfo?.success_url) {
            window.location.href = paymentInfo?.success_url || "";
        } else if (status === "failure" && paymentInfo?.cancel_url) {
            window.location.href = paymentInfo?.cancel_url || "";
        }
        if (status === "cancel") {
            window.history.back();
        }
        return true;
    } catch (e) {
        handleStripeLog(
            JSON.stringify({
                status,
                data,
                error: e,
                paymentInfo: paymentInfo?.metadata,
            }),
            paymentInfo
        );
        return false;
    }
};
