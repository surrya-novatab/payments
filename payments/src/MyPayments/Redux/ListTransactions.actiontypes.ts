import { TransactionsListingResult } from "../Models";

export const GetTransactionsListingType = "GET_TRANSACTIONS_LISTING";
export const RequestTransactionsType = "REQUEST_TRANSACTIONS";

export interface GetTransactionsListing {
    type: "GET_TRANSACTIONS_LISTING";
    payload: TransactionsListingResult;
}

export interface RequestTransactions {
    type: "REQUEST_TRANSACTIONS";
}

export type TransactionsAction = GetTransactionsListing | RequestTransactions;
