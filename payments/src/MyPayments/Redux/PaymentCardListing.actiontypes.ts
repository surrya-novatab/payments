import { ListPaymentCardState } from "../States/ListPaymentCardState";

export const GetPaymentCardListingType = "GET_PAYMENT_CARD_LISTING";
export const RequestPaymentCardListingType = "REQUEST_PAYMENT_CARD_LISTING";

export interface GetPaymentCardListing {
  type: "GET_PAYMENT_CARD_LISTING";
  payload: ListPaymentCardState;
}

export interface RequestPaymentCardListing {
  type: "REQUEST_PAYMENT_CARD_LISTING";
}

export type PaymentCardListingAction =
  | GetPaymentCardListing
  | RequestPaymentCardListing;
