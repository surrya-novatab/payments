import { useEffect, useState } from "react";
import { ApplicationState } from "src/Configs/Store";
import AddCardModalComponent from "./Components/AddCardModal";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import CardListingComponent from "./Components/CardListing";
import { paymentCardListingActions } from "../Redux/PaymentCardListing.actions";
import { MyRestaurantState } from "src/MyRestaurant/State/MyRestaurantState";
import { PaymentCardFormState } from "../States/PaymentCardFormState";
import Loading from "src/Shared/Components/Loading";
import { paymentCardFormActions } from "../Redux/PaymentCardForm.actions";
import { useToggle } from "src/Shared/Hooks";
import EditCardModalComponent from "./Components/EditCardModal";
import { PaymentCard } from "../Models";
import RenderOnCondition from "src/Shared/Components/RenderOnCondition";
import { toastActions } from "src/Shared/Components/Toast/Redux";
import { ToastSeverity } from "src/Shared/Components/Toast/Enum";

interface ComponentProps {
    resturant: MyRestaurantState;
    paymentCardForm: PaymentCardFormState;
}

type CombinedProps = typeof paymentCardListingActions &
    typeof paymentCardFormActions &
    typeof toastActions &
    ComponentProps;

const PaymentMethodComponent: React.FC<CombinedProps> = ({
    getPaymentCardListing,
    resetUpdatePaymentForm,
    resetDeletePaymentForm,
    resetCreatePaymentForm,
    editPaymentCard,
    openToast,
    resetPaymentForm,
    resturant,
    paymentCardForm,
}) => {
    const [isAddCard, setIsAddCard] = useToggle();
    const [isEditCard, setIsEditCard] = useToggle();

    const [editCard, setEditCard] = useState<PaymentCard>();
    const [isPrimaryCardUpdated, setIsPrimaryCardUpdated] = useState(false);

    useEffect(() => {
        getPaymentCardListing(resturant.selectedRestaurant.refId);
    }, []);
    useEffect(() => {
        if (
            paymentCardForm.isPaymentCardUpdated &&
            !paymentCardForm.errorMessage
        ) {
            getPaymentCardListing(resturant.selectedRestaurant.refId);
            resetUpdatePaymentForm();
            if (isPrimaryCardUpdated) {
                openToast(
                    true,
                    ToastSeverity.Success,
                    "Selected card changed as primary card"
                );
                handlePrimaryCardNotUpdated();
            } else {
                openToast(true, ToastSeverity.Success, "Card updated");
            }
        }
        if (isEditCard) {
            handleOnEditCardClose();
        }
    }, [
        paymentCardForm.isPaymentCardUpdated,
        paymentCardForm.errorMessage,
        isPrimaryCardUpdated,
    ]);

    useEffect(() => {
        if (paymentCardForm.errorMessage) {
            openToast(true, ToastSeverity.Error, paymentCardForm.errorMessage);
            resetPaymentForm();
        }
    }, [paymentCardForm.errorMessage]);

    useEffect(() => {
        if (
            paymentCardForm.isPaymentCardRemoved &&
            !paymentCardForm.errorMessage
        ) {
            getPaymentCardListing(resturant.selectedRestaurant.refId);
            resetDeletePaymentForm();
            openToast(true, ToastSeverity.Success, "Card removed");
        }
    }, [paymentCardForm.isPaymentCardRemoved, paymentCardForm.errorMessage]);

    useEffect(() => {
        if (
            paymentCardForm.isPaymentCardCreated &&
            !paymentCardForm.errorMessage
        ) {
            getPaymentCardListing(resturant.selectedRestaurant.refId);
            resetCreatePaymentForm();
            openToast(true, ToastSeverity.Success, "Card added");
        }
        if (isAddCard) {
            handleCloseAddCard();
        }
    }, [paymentCardForm.isPaymentCardCreated, paymentCardForm.errorMessage]);

    const handleOpenAddCard = () => setIsAddCard.open();
    const handleCloseAddCard = () => setIsAddCard.close();

    const handlePrimaryCardUpdated = () => {
        setIsPrimaryCardUpdated(true);
    };

    const handlePrimaryCardNotUpdated = () => {
        setIsPrimaryCardUpdated(false);
    };

    const handleOnEditCardOpen = (cardDetail: PaymentCard) => {
        setEditCard(cardDetail);
        setIsEditCard.open();
    };
    const handleOnEditCardClose = () => {
        setEditCard(undefined);
        setIsEditCard.close();
    };

    const handleOnEditCardSubmit = (updatedCard: PaymentCard) => {
        if (updatedCard.cvv) {
            editPaymentCard(
                {
                    accountToken: updatedCard.cardEndingNumber,
                    expiry: updatedCard.expiryDate,
                    name: updatedCard.name,
                    postal: updatedCard.postal,
                    cvv: updatedCard.cvv,
                },
                resturant.selectedRestaurant.refId,
                updatedCard.refId
            );
        }
    };

    if (paymentCardForm.loading) {
        return <Loading />;
    }

    return (
        <div className="page-content" style={{ paddingTop: "16px" }}>
            <h3 className="page-subheader__sub-title">Manage Payment Method</h3>
            <div className="d-flex align-items-center justify-content-between">
                <p className="d-flex">
                    Your <strong className="pl-1 pr-1">Subscription</strong>{" "}
                    will be debited from the primary card
                </p>
                <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={handleOpenAddCard}
                >
                    <i className="icon-plus icon-white icon-3x mr-1"></i> Add
                    New Card
                </button>
            </div>
            <CardListingComponent
                onOpenEditCard={handleOnEditCardOpen}
                onPrimaryCardUpdated={handlePrimaryCardUpdated}
            />
            <RenderOnCondition condition={isAddCard}>
                <AddCardModalComponent
                    isShow={isAddCard}
                    onCancel={handleCloseAddCard}
                    title="Add Card"
                />
            </RenderOnCondition>
            <RenderOnCondition condition={isEditCard}>
                <EditCardModalComponent
                    isShow={isEditCard}
                    onCancel={handleOnEditCardClose}
                    onSubmit={handleOnEditCardSubmit}
                    editCard={editCard}
                    title="Edit Card"
                />
            </RenderOnCondition>
        </div>
    );
};

function mapDispatchToProps(dispatch: any) {
    return bindActionCreators(
        {
            ...toastActions,
            ...paymentCardListingActions,
            ...paymentCardFormActions,
        },
        dispatch
    );
}
function mapStateToProps(state: ApplicationState) {
    return {
        paymentCardListing: state.paymentCardListing,
        resturant: state.restaurant,
        paymentCardForm: state.paymentCardForm,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaymentMethodComponent);
