export interface Transactions {
    createdDate: string;
    _id: string;
    amount: number;
    gatewayTransactionId: string;
    subscription: {
        _id: string;
        name: string;
    };
    paymentAccount: {
        cardEndingNumber: string;
    };
    invoiceUrl: string;
}
