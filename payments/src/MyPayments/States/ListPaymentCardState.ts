import { PaymentCard } from "../Models";

export interface ListPaymentCardState {
  paymentCards?: PaymentCard[];
  errorMessage: string;
  loading?: boolean;
}
