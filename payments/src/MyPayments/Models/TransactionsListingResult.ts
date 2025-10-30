import { TransactionPaginatedResult } from "./TransactionPaginatedResult";

export interface TransactionsListingResult {
    errorMessage: string;
    transactionPaginatedResult: TransactionPaginatedResult;
}
