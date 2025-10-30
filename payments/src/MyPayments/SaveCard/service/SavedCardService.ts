import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
export interface IMerchantDetails {
    publishable_key: string;
    account_id: string;
    base_url: string;
    merchantId: string;
    customerId: string;
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
