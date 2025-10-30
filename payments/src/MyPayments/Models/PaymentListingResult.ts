import { PaymentCard } from ".";

export interface PaymentListingResult {
  paymentCards: PaymentCard[];
  errorMessage: string;
}
