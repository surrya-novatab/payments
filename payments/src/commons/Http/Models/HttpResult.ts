export interface HttpResult {
    message?: any;
    success: boolean;
    response: any;
    headers: any;
    errorMessage: string;
    errorResponse: any;
    errorCode: number;
    isCancelled?: boolean;
    statusCode?: number;
}
