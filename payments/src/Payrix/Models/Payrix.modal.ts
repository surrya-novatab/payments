// ... existing code ...

export interface PaymentConfig {
    apiKey: string;
    merchantId: string;
    amount: number;
}

export interface PayrixPaymentPageInfo {
    merchant_id: string;
    api_key: string;
    amount: number;
    currency: string;
    metadata: {
        orderId: string;
        orderRefId: string;
        splitRefId: string | null;
        posSessionRefId: string;
        deviceId: string;
        employeeRefId: string;
        employeeName: string;
    };
    success_url: string;
    cancel_url: string;
    status: string;
    provider: string;
    account_id: string;
    amount_details: {
        tips: number | null;
        surcharge: number;
    };
    id: string;
    publishable_key?: string;
    paymentExternalUrl: string;
    paymentIntentId?: string;
    transactionId?: string;
    client_secret?: string;
    payment_mode?: string;
    wallets_only?: boolean;
    options?: {
        applePay?: boolean;
        googlePay?: boolean;
        saveCard?: boolean;
    };
    base_url?: string;
}

export interface PayrixSaveCardInfo {
    account_id: string;
    api_key: string;
    base_url: string;
    paymentExternalUrl?: string;
    publishable_key?: string;
}

export interface PayrixPaymentDetails {
    merchant_id: string;
    api_key: string;
    amount: number;
    success_url: string;
    cancel_url: string;
    wallets_only: boolean;
    status: string;
}

export interface PayrixApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export interface PayrixCardSaveResponse {
    success: boolean;
    paymentMethodId?: string;
    customerId?: string;
    error?: string;
}

export interface PayrixPaymentResponse {
    success: boolean;
    transactionId?: string;
    chargeId?: string;
    error?: string;
    receipt?: any;
}

export enum PayrixPaymentType {
    SAVE_CARD = "save-card",
    CARD_MANUAL = "card-manual",
    MOBILE_PAYMENT = "mobile-payment",
    SAVE_AND_PAY = "save-and-pay",
}

export interface PayrixLoadingState {
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
}
