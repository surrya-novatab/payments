import { HttpMethod, HttpParameterSubRoute, request } from "src/Commons/Http";
import { TransactionsListingResult } from "../Models";

export const getTransactions = async (
    restuarantRefId: string,
    fromDate: string,
    toDate: string,
    pageNo: number,
    recsPerPage: number
) => {
    const result = await request({
        endPoint: `Transactions/Restaurants/${restuarantRefId}/SubscriptionTransactions?fromDate=${fromDate}&toDate=${toDate}&pageNo=${pageNo}&recsPerPage=${recsPerPage}`,
        method: HttpMethod.GET,
        subRoute: HttpParameterSubRoute.Transactions,
    });
    let transactionPaginatedResult;
    let errorMessage = "";
    if (result.success) {
        transactionPaginatedResult = result.response;
    } else {
        errorMessage = result.errorMessage;
    }
    return {
        transactionPaginatedResult,
        errorMessage,
    } as TransactionsListingResult;
};
