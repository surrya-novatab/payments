import { ListPaymentCardState } from "./ListPaymentCardState";
import { PaymentCardFormState } from "./PaymentCardFormState";
import { ListTransactionsState } from "./ListTransactionsState";

export * from "./ListPaymentCardState";
export * from "./PaymentCardFormState";
export * from "./ListTransactionsState";

export interface MyPaymentStates {
    paymentCardListing: ListPaymentCardState;
    paymentCardForm: PaymentCardFormState;
    transactionList: ListTransactionsState;
}
