import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
export interface PaymentPageInfoResponse {
    merchant_id: string;
    amount: string;
    currency: string;
    metadata: {
        orderId: string;
        orderRefId: string;
        splitRefId: string | null;
        posSessionRefId: string;
        deviceid: string;
        employeeRefId: string;
        employeeName: string;
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
    publishable_key: string;
    paymentExternalUrl: string;
}
export const getPaymentPageInfoById = async (paymentPageId: string) => {
    const result = await request({
        endPoint: `stripe/payment-page/${paymentPageId}`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.paymentsMicroService,
    });
    return result.response;
};

