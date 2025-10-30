import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Accordion } from "react-bootstrap";
import { MyRestaurantState } from "src/MyRestaurant/State";
import { AccordionSwitchComponent } from "src/Shared/Components/Accordion";
import DateRangeComponent from "src/Shared/Components/DateRange";
import { AccordionSwitchHoc } from "src/Shared/Models";
import {
    getLastSixMonthsTimeinterval,
    parseDateToFormatInUTC,
    fromDateTimingOptions,
    toDateTimingOptions,
    parsableDateFormat,
} from "src/Shared/Utils/DateUtils";
import { listTransactionsActions } from "../Redux";
import { ListTransactionsState } from "../States";
import TransactionListingComponent from "./Components/TransactionListing";
import { ApplicationState } from "src/Configs/Store";
import { PaginationDetail } from "src/Shared/Enums";

interface ComponentProps {
    transactionList: ListTransactionsState;
    resturant: MyRestaurantState;
}

type CombinedProps = ComponentProps & typeof listTransactionsActions;

const TransactionHistoryComponent: React.FC<CombinedProps> = ({
    resturant,
    getTransactions,
}) => {
    const { startDate, endDate } = getLastSixMonthsTimeinterval();

    const [appliedStartDate, setAppliedStartDate] = useState<string>(startDate);
    const [appliedEndDate, setAppliedEndDate] = useState<string>(endDate);

    useEffect(() => {
        if (resturant.selectedRestaurant.refId) {
            handleAppliedDateRangeForTransaction(startDate, endDate);
        }
    }, [resturant.selectedRestaurant]);

    const handleAppliedDateRangeForTransaction = (
        startDate: string,
        endDate: string
    ) => {
        handleRequestForTransaction(
            startDate,
            endDate,
            PaginationDetail.DefaultPageNumber,
            PaginationDetail.DefaultPageSize
        );
    };

    const handleRequestForTransaction = (
        startDate: string,
        endDate: string,
        changedPage: string | number,
        changedPageSize: string | number
    ) => {
        const fromDateForRequestInUTC = parseDateToFormatInUTC(
            new Date(startDate),
            new Date(startDate)?.toDateString(),
            fromDateTimingOptions,
            undefined,
            parsableDateFormat
        );
        const toDateForRequestInUTC = parseDateToFormatInUTC(
            new Date(endDate),
            new Date(endDate)?.toDateString(),
            toDateTimingOptions,
            undefined,
            parsableDateFormat
        );
        getTransactions(
            resturant.selectedRestaurant.refId,
            fromDateForRequestInUTC,
            toDateForRequestInUTC,
            Number(changedPage),
            Number(changedPageSize)
        );
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
    };

    const handleOnPageChange = (
        changedPage: number,
        changedPageSize: number
    ) => {
        handleRequestForTransaction(
            appliedStartDate,
            appliedEndDate,
            changedPage,
            changedPageSize
        );
    };

    const handleOnPageSizeChange = (
        changedPage: number,
        changedPageSize: number
    ) => {
        handleRequestForTransaction(
            appliedStartDate,
            appliedEndDate,
            changedPage,
            changedPageSize
        );
    };

    return (
        <Accordion className="accordion-container__accordion-item">
            <AccordionSwitchComponent
                isHoc={true}
                eventKey={"transactionHistory"}
            >
                {({ isActiveAccordian, onClick }: AccordionSwitchHoc) => {
                    return (
                        <>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h3
                                    onClick={onClick}
                                    className="page-subheader__sub-title d-flex cursor-pointer mb-0"
                                >
                                    Transaction History
                                </h3>

                                <i
                                    onClick={onClick}
                                    className={`cursor-pointer icon-4x ${
                                        isActiveAccordian
                                            ? "icon-angle-up"
                                            : "icon-angle-down"
                                    }`}
                                />
                            </div>
                            <Accordion.Collapse
                                bsPrefix={
                                    "accordion-container__accordion-body w-100"
                                }
                                eventKey={"transactionHistory"}
                            >
                                <>
                                    <div className="text-right mb-3">
                                        <DateRangeComponent
                                            onApplyDateRange={
                                                handleAppliedDateRangeForTransaction
                                            }
                                            intialDateRange={{
                                                startDate: new Date(startDate),
                                                endDate: new Date(endDate),
                                            }}
                                            isAppliedDateRange={true}
                                        />
                                    </div>
                                    <TransactionListingComponent
                                        onPageChange={handleOnPageChange}
                                        onPageSizeChange={
                                            handleOnPageSizeChange
                                        }
                                    />
                                </>
                            </Accordion.Collapse>
                        </>
                    );
                }}
            </AccordionSwitchComponent>
        </Accordion>
    );
};
function mapDispatchToProps(dispatch: any) {
    return bindActionCreators(
        {
            ...listTransactionsActions,
        },
        dispatch
    );
}
function mapStateToProps(state: ApplicationState) {
    return {
        transactionList: state.transactionList,
        resturant: state.restaurant,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TransactionHistoryComponent);
