import React, { useEffect, useState } from "react";
import { ApplicationState } from "src/Configs/Store";
import { connect } from "react-redux";
import Loading from "src/Shared/Components/Loading";
import { extractTimeFromUTCTimestamp } from "src/Shared/Utils/DateUtils";
import RenderOnCondition from "src/Shared/Components/RenderOnCondition";
import { formInvoiceDownloadLink } from "src/Shared/Utils/HTMLUtils";
import {
    getAuthenticatedHeader,
    getAuthenticatedHeaderAsObject,
} from "src/Commons/Auth/Service/Auth.service";
import PageyComponent from "src/Shared/Components/Pagination/Components/Pagey";
import { PageyProps } from "src/Shared/Components/Pagination/Models";
import PaginationComponent from "src/Shared/Components/Pagination";
import { Transactions } from "src/MyPayments/Models";
import { ListTransactionsState } from "src/MyPayments/States";
import { EmptyOrdersSvg } from "src/Orders/Assets";

interface ComponentProps {
    onPageChange: (page: number, pageSize: number) => void;
    onPageSizeChange: (page: number, pageSize: number) => void;
    transactionList: ListTransactionsState;
}

const TransactionListingComponent: React.FC<ComponentProps> = ({
    onPageChange,
    onPageSizeChange,
    transactionList,
}) => {
    const [totalCount, setTotalCounts] = useState<number>();

    useEffect(() => {
        if (
            transactionList.transactionPaginatedResult?.totalRecords ||
            !totalCount
        ) {
            setTotalCounts(
                transactionList.transactionPaginatedResult?.totalRecords ?? 0
            );
        }
    }, [transactionList.transactionPaginatedResult?.totalRecords]);

    if (transactionList.loading) {
        return <Loading />;
    }

    const handleDownloadInvoice = (particularTransaction: Transactions) => {
        const authenticatedHeader = getAuthenticatedHeaderAsObject();
        fetch(formInvoiceDownloadLink(particularTransaction.invoiceUrl), {
            headers: authenticatedHeader,
        })
            .then((response) => response.blob())
            .then((blob) => {
                var url = window.URL.createObjectURL(blob);
                const tab = window.open();
                if (tab) {
                    tab.location.href = url;
                }
            });
    };

    const renderTransactions = () => {
        const transactions =
            transactionList.transactionPaginatedResult?.records ?? [];
        return transactions.map((eachTransactions, index) => {
            return (
                <tr key={index}>
                    <td className="text-left" data-label="Payment Date">
                        {eachTransactions.createdDate}
                    </td>
                    <td className="text-left" data-label="Invoice ID">
                        {eachTransactions?.gatewayTransactionId}
                    </td>
                    <td className="text-left" data-label="Payment Card">
                        <RenderOnCondition
                            condition={
                                !!eachTransactions.paymentAccount
                                    ?.cardEndingNumber
                            }
                        >
                            {`Ending with ${eachTransactions.paymentAccount?.cardEndingNumber?.slice(
                                -4
                            )}`}
                        </RenderOnCondition>
                    </td>
                    <td className="text-left" data-label="Plan Name">
                        {eachTransactions.subscription?.name}
                    </td>
                    <td className="text-left" data-label="Adds on Any"></td>
                    <td className="text-right" data-label="Transaction Amount">
                        ${eachTransactions.amount?.toFixed(2)}
                    </td>
                    <td data-label="Dowloand Invoice">
                        <i
                            onClick={() =>
                                handleDownloadInvoice(eachTransactions)
                            }
                            className="icon-receipt-item icon-4x cursor-pointer"
                        ></i>
                    </td>
                </tr>
            );
        });
    };

    return (
        <>
            <table className="table">
                <RenderOnCondition
                    condition={
                        !transactionList?.transactionPaginatedResult?.records
                            ?.length
                    }
                >
                    <caption className="mt-5 mb-3">
                        <img src={EmptyOrdersSvg} alt={"Empty orders"} />
                    </caption>
                    <caption className="font-semibold">
                        No Transaction is available for the selected date
                    </caption>
                </RenderOnCondition>
                <thead>
                    <tr>
                        <th className="text-left">Payment Date</th>
                        <th className="text-left">Invoice ID</th>
                        <th className="text-left">Payment Card</th>
                        <th className="text-left">Plan Name</th>
                        <th className="text-left">Adds on Any</th>
                        <th className="text-right">Transaction Amount</th>
                        <th>Download Invoice</th>
                    </tr>
                </thead>
                <tbody>{renderTransactions()}</tbody>
            </table>
            <div className={"pagination-wrap justify-content-end mb-3"}>
                <PageyComponent
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    currentPage={Number(
                        transactionList.transactionPaginatedResult
                            ?.pagingDetails?.pageNo
                    )}
                    currentPageSize={Number(
                        transactionList.transactionPaginatedResult
                            ?.pagingDetails?.recsPerPage
                    )}
                    totalRecords={Number(totalCount)}
                >
                    {(pageyProps: PageyProps) => {
                        return <PaginationComponent {...pageyProps} />;
                    }}
                </PageyComponent>
            </div>
        </>
    );
};

function mapStateToProps(state: ApplicationState) {
    return {
        transactionList: state.transactionList,
        resturant: state.restaurant,
    };
}

export default connect(mapStateToProps)(TransactionListingComponent);
