import { Pagination } from "src/Shared/Components/Pagination/Models";
import { Transactions } from "./Transactions";

export interface TransactionPaginatedResult{
    totalRecords:number;
    records:Transactions[],
    pagingDetails:Pagination
}
