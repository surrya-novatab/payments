import { Action, Reducer } from "redux";
import { PaymentCardFormState } from "../States/PaymentCardFormState";
import * as PaymentCardFormActions from "./PaymentCardForm.actiontypes";

const unloadedState: PaymentCardFormState = {
    errorMessage: "",
    refId: "",
    loading: false,
    isPaymentCardUpdated: false,
    isPaymentCardCreated: false,
    isPaymentCardRemoved: false,
};

export const reducerPaymentCardForm: Reducer<PaymentCardFormState> = (
    state: PaymentCardFormState | undefined,
    incomingAction: Action
): PaymentCardFormState => {
    if (state === undefined) {
        return unloadedState;
    }
    const action =
        incomingAction as PaymentCardFormActions.PaymentCardFormAction;
    switch (action.type) {
        case PaymentCardFormActions.SetDefaultPaymentCardType:
            return {
                ...state,
                ...action.payload,
                loading: false,
                isPaymentCardUpdated: true,
            };
        case PaymentCardFormActions.AddPaymentCardType:
            return {
                ...state,
                ...action.payload,
                loading: false,
                isPaymentCardCreated: true,
            };
        case PaymentCardFormActions.EditPaymentCardType:
            return {
                ...state,
                ...action.payload,
                loading: false,
                isPaymentCardUpdated: true,
            };
        case PaymentCardFormActions.RemovePaymentCardType:
            return {
                ...state,
                ...action.payload,
                loading: false,
                isPaymentCardRemoved: true,
            };
        case PaymentCardFormActions.RequestPaymentCardFormType:
            return {
                ...state,
                loading: true,
            };
        case PaymentCardFormActions.ResetUpdatePaymentCardFormType:
            return {
                ...state,
                loading: false,
                errorMessage: "",
                isPaymentCardUpdated: false,
            };
        case PaymentCardFormActions.ResetDeleltePaymentCardFormType:
            return {
                ...state,
                loading: false,
                errorMessage: "",
                isPaymentCardRemoved: false,
            };
        case PaymentCardFormActions.ResetCreatePaymentCardFormType:
            return {
                ...state,
                loading: false,
                errorMessage: "",
                isPaymentCardCreated: false,
            };
        case PaymentCardFormActions.RemovePaymentCardType:
            return {
                ...state,
                loading: false,
                errorMessage: "",
                isPaymentCardCreated: false,
                isPaymentCardRemoved: false,
                isPaymentCardUpdated: false,
            };
        case PaymentCardFormActions.ResetPaymentCardFormType:
            return {
                ...state,
                loading: false,
                errorMessage: "",
                isPaymentCardCreated: false,
                isPaymentCardRemoved: false,
                isPaymentCardUpdated: false,
            };
        default:
            break;
    }

    return state;
};
