import { Action, Reducer } from "redux";
import { ListPaymentCardState } from "../States/ListPaymentCardState";
import * as PaymentCardListingActions from "./PaymentCardListing.actiontypes";

const unloadedState: ListPaymentCardState = {
  errorMessage: "",
  paymentCards: [],
  loading: false,
};

export const reducerPaymentCardListing: Reducer<ListPaymentCardState> = (
  state: ListPaymentCardState | undefined,
  incomingAction: Action
): ListPaymentCardState => {
  if (state === undefined) {
    return unloadedState;
  }
  const action =
    incomingAction as PaymentCardListingActions.PaymentCardListingAction;
  switch (action.type) {
    case PaymentCardListingActions.GetPaymentCardListingType:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    case PaymentCardListingActions.RequestPaymentCardListingType:
      return {
        ...state,
        loading: true,
      };
    default:
      break;
  }

  return state;
};
