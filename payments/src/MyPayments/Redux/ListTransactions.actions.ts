import { AppThunkAction } from "src/Configs/Store";
import { getTransactions } from "../Services/Transactions.service";
import * as TransactionsActions from "./ListTransactions.actiontypes";

export const listTransactionsActions = {
    getTransactions:
        (
            resturantRefId: string,
            fromDate: string,
            toDate: string,
            pageNo: number,
            recsPerPage: number
        ): AppThunkAction<
            | TransactionsActions.GetTransactionsListing
            | TransactionsActions.RequestTransactions
        > =>
        async (dispatch) => {
            dispatch({
                type: TransactionsActions.RequestTransactionsType,
            });
            const response = await getTransactions(
                resturantRefId,
                fromDate,
                toDate,
                pageNo,
                recsPerPage
            );
            dispatch({
                type: TransactionsActions.GetTransactionsListingType,
                payload: response,
            });
        },
};
