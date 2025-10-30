import { useState } from "react";
import { CardConnectTokenResult, CardDetail } from "src/Payments/Models";
import CardConnectComponent from "src/Payments/Shared/CardConnect";
import Modal from "src/Shared/Components/Modal";
import {
    isEmptyString,
    isNotValidFormObject,
    isValidCvv,
    isValidNumber,
    isValidPostal,
    isValidText,
} from "src/Shared/Utils/Validators";
import RenderOnCondition from "src/Shared/Components/RenderOnCondition";
import { isEmpty, pathOr } from "ramda";
import { paymentCardFormActions } from "src/MyPayments/Redux/PaymentCardForm.actions";
import { ApplicationState } from "src/Configs/Store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { MyRestaurantState } from "src/MyRestaurant/State/MyRestaurantState";
import { PaymentCardFormState } from "src/MyPayments/States/PaymentCardFormState";
import { toastActions } from "src/Shared/Components/Toast/Redux";

interface ComponentProps {
    title: string;
    onCancel: (e?: any) => void;
    isShow: boolean;
    resturant?: MyRestaurantState;
    paymentCardForm?: PaymentCardFormState;
}

type CombinedProps = ComponentProps &
    typeof toastActions &
    typeof paymentCardFormActions;

const defaultCardDetail = {
    name: "",
    cvv: "",
    postal: "",
};

const defaultCardErrorState = {
    name: false,
    cvv: false,
    postal: false,
};

const AddCardModalComponent: React.FC<CombinedProps> = ({
    title,
    isShow,
    onCancel,
    resturant,
    paymentCardForm,
    addPaymentCard,
}) => {
    const [cardAccount, setCardAccount] = useState<CardConnectTokenResult>();

    const [isCardDetailTyping, setIsCardDetailTyping] = useState(false);

    const [cardDetail, setCardDetail] = useState<CardDetail>(defaultCardDetail);

    const [errorCardDetail, setErrorCardDetail] = useState(
        defaultCardErrorState
    );
    const [cardConnectErrorMessage, setCardConnectErrorMessage] = useState("");

    const [errorAccount, setErrorAccount] = useState<CardConnectTokenResult>();

    const handleNameChange = ({
        target,
    }: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        if (isValidText(value)) {
            setCardDetail((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            setErrorCardDetail((prevState) => ({
                ...prevState,
                [name]: !isValidText(value) || isEmptyString(value),
            }));
        }
    };
    const handlePostalChange = ({
        target,
    }: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        setCardDetail((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleOnBlurPostal = () => {
        setErrorCardDetail((prevState) => ({
            ...prevState,
            postal: !isValidPostal(cardDetail.postal),
        }));
    };

    const handleOnCardAccountChange = (
        accountToken: CardConnectTokenResult
    ) => {
        setCardAccount(accountToken);
    };

    const handleOnErrorCard = (errorMessage: string) => {
        setCardConnectErrorMessage(errorMessage);
    };

    const handleOnCardTyping = (typing: boolean) => {
        if (!cardAccount?.token) {
            setIsCardDetailTyping(typing);
        }
    };

    const handleCvvChange = ({
        target,
    }: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        if (isValidNumber(value)) {
            setCardDetail((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            setErrorCardDetail((prevState) => ({
                ...prevState,
                cvv: false,
            }));
        }
    };

    const handleOnBlurCvv = () => {
        setErrorCardDetail((prevState) => ({
            ...prevState,
            cvv: !isValidCvv(cardDetail.cvv),
        }));
    };

    const handleOnAddCardSubmit = () => {
        if (
            errorCardDetail.cvv ||
            errorCardDetail.name ||
            errorCardDetail.postal ||
            isNotValidFormObject(cardDetail) ||
            !cardAccount?.token ||
            !cardDetail.name ||
            !cardDetail.cvv ||
            !cardDetail.postal
        ) {
            setErrorCardDetail({
                name:
                    !isValidText(cardDetail.name) ||
                    isEmptyString(cardDetail.name),
                cvv: !isValidCvv(cardDetail.cvv),
                postal: !isValidPostal(cardDetail.postal),
            });
            if (!cardAccount) {
                setErrorAccount({
                    errorMessage: "Credit Card Number is Required",
                    token: "",
                    message: "",
                    errorCode: "",
                    expiry: "",
                });
            }
        } else if (
            cardAccount &&
            !isEmptyString(pathOr("", ["token"], cardAccount))
        ) {
            addPaymentCard(
                {
                    accountToken: cardAccount.token,
                    expiry: cardAccount.expiry,
                    name: cardDetail.name,
                    cvv: cardDetail.cvv,
                    city: "",
                    region: "",
                    address: "",
                    postal: cardDetail.postal,
                    country: "US",
                },
                resturant?.selectedRestaurant.refId ?? ""
            );
        } else {
            setErrorAccount({
                errorMessage: "Credit Card Number is Required",
                token: "",
                message: "",
                errorCode: "",
                expiry: "",
            });
        }
    };
    const bodyContent = () => {
        return (
            <form className="card-connect">
                <div className="form-row ml-1">
                    <label className="form-label form-label__form--medium">
                        Name on Card
                    </label>
                    <input
                        onChange={handleNameChange}
                        onBlur={handleNameChange}
                        type="text"
                        className={`form-control ${
                            errorCardDetail.name ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your name on card"
                        name="name"
                        autoFocus
                        value={cardDetail.name}
                    />
                    <RenderOnCondition condition={errorCardDetail.name}>
                        <span className="invalid-feedback">
                            Please enter name on card
                        </span>
                    </RenderOnCondition>
                </div>
                <div className="card__connect">
                    <CardConnectComponent
                        cardAccount={cardAccount}
                        onCardChange={handleOnCardAccountChange}
                        onError={handleOnErrorCard}
                        onCardTyping={handleOnCardTyping}
                    />
                </div>
                <RenderOnCondition condition={!!cardConnectErrorMessage}>
                    <span className="card-connect invalid-feedback ml-1 mt-2">
                        {cardConnectErrorMessage}
                    </span>
                </RenderOnCondition>
                <div className="form-row ml-1 mt-3 row">
                    <div className="form-row col-6 pl-0">
                        <label className="form-label form-label__form--medium">
                            CVV
                            <div className="tooltip f-right">
                                <span className="icon-help-circle"></span>
                                <span className="tooltiptext tooltip-horizontal">
                                    CVV is the last 3 or 4 digits on the back of
                                    your credit card
                                </span>
                            </div>
                        </label>

                        <input
                            type="text"
                            onChange={handleCvvChange}
                            onBlur={handleOnBlurCvv}
                            className={`form-control  ${
                                errorCardDetail.cvv ? "is-invalid" : ""
                            }`}
                            value={cardDetail.cvv}
                            placeholder="XXXX"
                            name="cvv"
                        />
                        <RenderOnCondition condition={errorCardDetail.cvv}>
                            <span className="invalid-feedback">
                                Please enter valid cvv
                            </span>
                        </RenderOnCondition>
                    </div>
                    <div className="form-row col-6 ">
                        <label className="form-label form-label__form--medium">
                            Zip Code
                        </label>
                        <input
                            onChange={handlePostalChange}
                            onBlur={handleOnBlurPostal}
                            type="text"
                            className={`form-control  ${
                                errorCardDetail.postal ? "is-invalid" : ""
                            }`}
                            placeholder="Enter zip code"
                            name="postal"
                            value={cardDetail.postal}
                        />
                        <RenderOnCondition condition={errorCardDetail.postal}>
                            <span className="invalid-feedback">
                                Please enter valid zip code
                            </span>
                        </RenderOnCondition>
                    </div>
                </div>
            </form>
        );
    };

    const footerContent = () => {
        return (
            <>
                <button
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    onMouseDown={onCancel}
                >
                    Cancel
                </button>
                <button
                    onClick={handleOnAddCardSubmit}
                    disabled={isCardDetailTyping && !cardAccount?.token}
                    type="button"
                    className="btn btn-primary"
                >
                    Save
                </button>
            </>
        );
    };

    return (
        <Modal
            title={title}
            body={bodyContent()}
            footer={footerContent()}
            isShow={isShow}
            onHide={onCancel}
        />
    );
};

function mapDispatchToProps(dispatch: any) {
    return bindActionCreators(
        {
            ...toastActions,
            ...paymentCardFormActions,
        },
        dispatch
    );
}
function mapStateToProps(state: ApplicationState) {
    return {
        resturant: state.restaurant,
        paymentCardForm: state.paymentCardForm,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddCardModalComponent);
