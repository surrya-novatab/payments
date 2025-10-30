import { PaymentCard } from "src/MyPayments/Models";
import Dropdown from "react-bootstrap/Dropdown";
import RenderOnCondition from "src/Shared/Components/RenderOnCondition";
import * as MaskData from "maskdata";
import { join, splitAt } from "ramda";

interface ComponentProps {
    paymentCard: PaymentCard;
    onMakePrimaryCard: (paymentCard: PaymentCard) => void;
    onEdit: (paymentCard: PaymentCard) => void;
    onRemove: (paymentCard: PaymentCard) => void;
}

const maskCardOptions = {
    maskWith: "*",
    unmaskedStartDigits: 0,
    unmaskedEndDigits: 4,
};

const CardComponent: React.FC<ComponentProps> = ({
    paymentCard,
    onMakePrimaryCard,
    onEdit,
    onRemove,
}) => {
    const handleMakePrimary = () => {
        onMakePrimaryCard(paymentCard);
    };

    const handleOnEdit = () => {
        onEdit(paymentCard);
    };

    const handleOnRemove = () => {
        if (!paymentCard.defaultAccount) {
            onRemove(paymentCard);
        }
    };

    return (
        <div className="col-lg-3 col-md-4 col-sm-4 mt-2">
            <div className="credit-card">
                <div className="credit-header">
                    <div className="credit-number">
                        <h4 className="credit-number__card-number">
                            <i className="icon-mastercard"></i>
                            {MaskData.maskCard(
                                paymentCard.cardEndingNumber,
                                maskCardOptions
                            )}
                        </h4>
                    </div>
                    <RenderOnCondition condition={paymentCard.defaultAccount}>
                        <span className="badge badge-info d-inline-block">
                            Primary
                        </span>
                    </RenderOnCondition>
                    <div className="credit-action tooltip">
                        <Dropdown>
                            <Dropdown.Toggle childBsPrefix="bg-white dropdown-noborder">
                                <i className="icon-icon-ellipsis-v icon-3x"></i>
                                <span className="tooltiptext">Edit</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <ul className="list-unstyled">
                                    <li
                                        onClick={handleOnEdit}
                                        className="dropdown-item dropdown__dropdown-border"
                                    >
                                        <p>Edit</p>
                                    </li>
                                    <li
                                        onClick={handleOnRemove}
                                        className="dropdown-item dropdown__dropdown-border"
                                    >
                                        <p
                                            className={
                                                paymentCard.defaultAccount
                                                    ? "disabled"
                                                    : ""
                                            }
                                        >
                                            Remove
                                        </p>
                                    </li>
                                    <RenderOnCondition
                                        condition={!paymentCard.defaultAccount}
                                    >
                                        <li
                                            onClick={handleMakePrimary}
                                            className="dropdown-item"
                                        >
                                            <p>Make Primary</p>
                                        </li>
                                    </RenderOnCondition>
                                </ul>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
                <div className="credit-footer">
                    <div className="credit-name">
                        <p className="credit-name__help-text">
                            Card Holder Name
                        </p>
                        <h4 className="credit-name__card-holder">
                            {paymentCard.name}
                        </h4>
                    </div>
                    <div className="credit-valid">
                        <p className="credit-valid__help-text">Valid Thru</p>
                        <h4 className="credit-valid__card-valid">
                            {join("/", splitAt(2, paymentCard.expiryDate))}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardComponent;
