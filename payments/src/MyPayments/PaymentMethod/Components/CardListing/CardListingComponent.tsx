import { ApplicationState } from "src/Configs/Store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
    paymentCardListingActions,
    paymentCardFormActions,
} from "src/MyPayments/Redux";
import { ListPaymentCardState } from "src/MyPayments/States";
import Loading from "src/Shared/Components/Loading";
import CardComponent from "../Card";
import { MyRestaurantState } from "src/MyRestaurant/State";
import { PaymentCard } from "src/MyPayments/Models";
import { move } from "ramda";
import { useToggle } from "src/Shared/Hooks";
import { useState } from "react";
import ConfirmDialog from "src/Shared/Components/ConfirmDialog";

interface ComponentProps {
    paymentCardListing: ListPaymentCardState;
    restuarant: MyRestaurantState;
    onOpenEditCard: (card: PaymentCard) => void;
    onPrimaryCardUpdated: () => void;
}

type CombinedProps = ComponentProps &
    typeof paymentCardListingActions &
    typeof paymentCardFormActions;

const CardListingComponent: React.FC<CombinedProps> = ({
    paymentCardListing,
    setDefaultPaymentCard,
    removePaymentCard,
    restuarant,
    onOpenEditCard,
    onPrimaryCardUpdated,
}) => {
    const [deleteCard, setDeleteCard] = useState<PaymentCard>();

    const [isDeleteCard, handleIsDeleteCard] = useToggle();

    if (paymentCardListing.loading) {
        return <Loading />;
    }

    const handleMakePrimaryCard = (paymentCard: PaymentCard) => {
        onPrimaryCardUpdated();
        setDefaultPaymentCard(
            restuarant.selectedRestaurant.refId,
            paymentCard.refId
        );
    };

    const handleEditCard = (paymentCard: PaymentCard) => {
        onOpenEditCard(paymentCard);
    };

    const handleRemoveCard = (paymentCard: PaymentCard) => {
        setDeleteCard(paymentCard);
        handleIsDeleteCard.open();
    };

    const handleOnConfirmDelete = () => {
        if (deleteCard) {
            removePaymentCard(
                restuarant.selectedRestaurant.refId,
                deleteCard.refId
            );
            handleIsDeleteCard.close();
        }
    };

    const handleOnDeleteCardCancel = () => {
        setDeleteCard(undefined);
        handleIsDeleteCard.close();
    };

    const sortedPaymentCards = () => {
        const indexOfPrimaryCard =
            paymentCardListing.paymentCards &&
            paymentCardListing.paymentCards.findIndex(
                (paymentCard) => paymentCard.defaultAccount
            );
        if (indexOfPrimaryCard) {
            return move(
                indexOfPrimaryCard,
                0
            )(paymentCardListing.paymentCards ?? []);
        } else {
            return paymentCardListing.paymentCards ?? [];
        }
    };

    const renderCards = () => {
        const paymentCards = sortedPaymentCards();
        if(Array.isArray(paymentCards) && paymentCards?.length > 0){
            return paymentCards.map((paymentCard, index) => {
                return (
                    <CardComponent
                        key={index}
                        paymentCard={paymentCard}
                        onEdit={handleEditCard}
                        onRemove={handleRemoveCard}
                        onMakePrimaryCard={handleMakePrimaryCard}
                    />
                );
            });
        }else {
            return null;
        }
        
    };

    const renderDeleteBodyContent = () => {
        return (
            <span>
                Are you sure you want to delete the card with ending
                number&nbsp;
                <b>{deleteCard?.cardEndingNumber?.slice(-4)}</b>
            </span>
        );
    };

    return (
        <>
            <div className="row">{renderCards()}</div>
            <ConfirmDialog
                primarButtonTitle="Delete"
                secondaryButtonTitle="Cancel"
                onClickPrimaryBtn={handleOnConfirmDelete}
                onCancel={handleOnDeleteCardCancel}
                onClickSecondarybtn={handleOnDeleteCardCancel}
                confirmationBodyContent={renderDeleteBodyContent()}
                title="Delete Card"
                isShow={isDeleteCard}
            />
        </>
    );
};

function mapDispatchToProps(dispatch: any) {
    return bindActionCreators(
        {
            ...paymentCardListingActions,
            ...paymentCardFormActions,
        },
        dispatch
    );
}
function mapStateToProps(state: ApplicationState) {
    return {
        paymentCardListing: state.paymentCardListing,
        restuarant: state.restaurant,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CardListingComponent);
