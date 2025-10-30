import { reducerPaymentCardForm } from "./PaymentCardForm.reducers";
import { reducerPaymentCardListing } from "./PaymentCardListing.reducers";
import { reducerListTransactions } from "./ListTransactions.reducers";

export * from "src/MyPayments/Redux/PaymentCardListing.actions";
export * from "src/MyPayments/Redux/PaymentCardForm.actions";
export * from "src/MyPayments/Redux/ListTransactions.actions";

export const myPaymentsReducers = {
    paymentCardListing: reducerPaymentCardListing,
    paymentCardForm: reducerPaymentCardForm,
    transactionList: reducerListTransactions,
};
