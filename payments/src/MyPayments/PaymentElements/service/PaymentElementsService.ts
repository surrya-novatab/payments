import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
export interface PaymentPageInfoResponse {
    merchant_id: string;
    amount: string;
    currency: string;
    metadata: {
        orderId?: string;
        orderRefId: string;
        splitRefId?: string | null;
        posSessionRefId?: string;
        deviceId?: string;
        employeeRefId?: string;
        employeeName?: string;
        customer_name?: string;
        applicationName?: string;
    };
    success_url: string;
    cancel_url: string;
    status: string;
    provider: string;
    account_id: string;
    amount_details: {
        tips: string | null;
        surcharge: string;
    };
    id: string;
    wallets_only?: boolean;
    publishable_key: string;
    paymentExternalUrl: string;
    paymentIntentId: string;
    transactionId: string;
    client_secret: string;
    payment_mode?: string;
    options?: any;
}
export const getPaymentPageInfoById = async (paymentPageId: string) => {
    const result = await request({
        endPoint: `stripe/payment-page/${paymentPageId}`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
    });
    return result.response;
};

