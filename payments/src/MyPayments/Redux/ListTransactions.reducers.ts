import { Action, Reducer } from "redux";
import { ListTransactionsState } from "../States";
import * as TransactionsActions from "./ListTransactions.actiontypes";

const unloadedState: ListTransactionsState = {
    errorMessage: "",
    loading: false,
};

export const reducerListTransactions: Reducer<ListTransactionsState> = (
    state: ListTransactionsState | undefined,
    incomingAction: Action
): ListTransactionsState => {
    if (state === undefined) {
        return unloadedState;
    }
    const action = incomingAction as TransactionsActions.TransactionsAction;
    switch (action.type) {
        case TransactionsActions.GetTransactionsListingType:
            return {
                ...state,
                ...action.payload,
                loading: false,
            };
        case TransactionsActions.RequestTransactionsType:
            return {
                ...state,
                loading: true,
            };
        default:
            break;
    }

    return state;
};
