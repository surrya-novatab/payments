import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
import {
    PaymentListingResult,
    SetDefaultPaymentCardResult,
    RemovePaymentCardResult,
} from "../Models";

export const getPaymentCardListing = async (restuarantRefId: string) => {
    const result = await request({
        endPoint: `Restaurants/${restuarantRefId}/Accounts/`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.Payments,
    });
    let paymentCards = [];
    let errorMessage = "";
    if (result.success) {
        paymentCards = result.response;
    } else {
        errorMessage = result.errorMessage;
    }
    return { paymentCards, errorMessage } as PaymentListingResult;
};

export const setDefaultPaymentCard = async (
    restuarantRefId: string,
    paymentCardRefId: string
) => {
    const result = await request({
        endPoint: `Restaurants/${restuarantRefId}/DefaultAccount/${paymentCardRefId}`,
        method: HttpMethod.PATCH,
        subRoute: HttpParameterSubRoute.Payments,
    });
    let refId = "";
    let errorMessage = "";
    if (result.success) {
        refId = result.response;
    } else {
        errorMessage = result.errorMessage;
    }
    return { refId, errorMessage } as SetDefaultPaymentCardResult;
};

export const removePaymentCard = async (
    restuarantRefId: string,
    paymentCardRefId: string
) => {
    const result = await request({
        endPoint: `Restaurants/${restuarantRefId}/Accounts/${paymentCardRefId}`,
        method: HttpMethod.DELETE,
        subRoute: HttpParameterSubRoute.Payments,
    });
    let refId = "";
    let errorMessage = "";
    if (result.success) {
        refId = result.response;
    } else {
        errorMessage = result.errorMessage;
    }
    return { refId, errorMessage } as RemovePaymentCardResult;
};
