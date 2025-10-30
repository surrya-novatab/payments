export interface PaymentCardFormState {
    refId: string;
    errorMessage: string;
    loading?: boolean;
    isPaymentCardUpdated: boolean;
    isPaymentCardCreated: boolean;
    isPaymentCardRemoved: boolean;
}
