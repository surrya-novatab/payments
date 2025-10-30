import { TransactionPaginatedResult } from "../Models";

export interface ListTransactionsState {
    transactionPaginatedResult?: TransactionPaginatedResult;
    errorMessage: string;
    loading?: boolean;
}
