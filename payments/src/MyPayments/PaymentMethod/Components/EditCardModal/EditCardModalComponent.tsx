import { useEffect, useState } from "react";
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
import { paymentCardFormActions } from "src/MyPayments/Redux/PaymentCardForm.actions";
import { ApplicationState } from "src/Configs/Store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { MyRestaurantState } from "src/MyRestaurant/State/MyRestaurantState";
import { PaymentCardFormState } from "src/MyPayments/States/PaymentCardFormState";
import { PaymentCard } from "src/MyPayments/Models";
import * as MaskData from "maskdata";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isEmpty } from "ramda";
import {
    converExpiryDateToJsDate,
    convertGivenTimeStampToSpeicifedFormat,
    isNotAboveCurrentDate,
} from "src/Shared/Utils/DateUtils";
import { toastActions } from "src/Shared/Components/Toast/Redux";

interface ComponentProps {
    title: string;
    onCancel: (e?: any) => void;
    isShow: boolean;
    resturant?: MyRestaurantState;
    paymentCardForm?: PaymentCardFormState;
    editCard?: PaymentCard;
    onSubmit: (card: PaymentCard) => void;
}

type CombinedProps = ComponentProps & typeof toastActions & typeof paymentCardFormActions;

const defaultCardDetail = {
    createdDate: "",
    defaultAccount: false,
    _id: "",
    accountType: "",
    cardEndingNumber: "",
    expiryDate: "",
    partnerId: "",
    postal: "",
    name: "",
    refId: "",
    cvv: "",
};

const defaultCardErrorState = {
    name: false,
    expiryDate: false,
    postal: false,
    cvv: false,
};

const maskCardOptions = {
    maskWith: "*",
    unmaskedStartDigits: 0,
    unmaskedEndDigits: 4,
};

const EditCardModalComponent: React.FC<CombinedProps> = ({
    title,
    isShow,
    onCancel,
    onSubmit,
    editCard,
}) => {
    const [cardDetail, setCardDetail] = useState<PaymentCard>(defaultCardDetail);

    const [errorCardDetail, setErrorCardDetail] = useState(defaultCardErrorState);

    useEffect(() => {
        if (editCard) {
            setCardDetail(editCard);
        }
    }, [editCard]);

    const handleNameChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
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

    const handlePostalChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = target;
        setCardDetail((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleOnBlurPostal = () => {
        setErrorCardDetail((prevState) => ({
            ...prevState,
            postal: !isValidPostal(cardDetail.postal ?? ""),
        }));
    };

    const handleCvvChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleonBlurCvvChange = () => {
        setErrorCardDetail((prevState) => ({
            ...prevState,
            cvv: !isValidCvv(cardDetail?.cvv ?? ""),
        }));
    };

    const handleOnEditCardSubmit = () => {
        if (
            errorCardDetail.expiryDate ||
            errorCardDetail.name ||
            errorCardDetail.postal ||
            errorCardDetail.cvv ||
            !cardDetail.cvv ||
            !cardDetail.name ||
            !cardDetail.postal ||
            isNotValidFormObject(cardDetail)
        ) {
            setErrorCardDetail({
                name: !isValidText(cardDetail.name) || isEmptyString(cardDetail.name),
                expiryDate: isNotAboveCurrentDate(converExpiryDateToJsDate(cardDetail.expiryDate)),
                postal: !isValidPostal(cardDetail?.postal ?? ""),

                cvv: !isValidCvv(cardDetail?.cvv ?? ""),
            });
        } else {
            onSubmit(cardDetail);
            setCardDetail(defaultCardDetail);
            setErrorCardDetail(defaultCardErrorState);
        }
    };

    const handleExpiryChange = (date: Date | null) => {
        if (date) {
            setCardDetail((prevState) => ({
                ...prevState,
                expiryDate: convertGivenTimeStampToSpeicifedFormat(
                    date,
                    "LLyy"
                ),
            }));

            setErrorCardDetail({
                ...errorCardDetail,
                expiryDate: isNotAboveCurrentDate(date),
            });
        }
    };
    const bodyContent = () => {
        return (
            <form>
                <div className="form-row">
                    <label className="form-label form-label__form--medium">
                        Card Ending Number
                    </label>
                    {MaskData.maskCard(
                        cardDetail.cardEndingNumber,
                        maskCardOptions
                    )}
                    <RenderOnCondition condition={errorCardDetail.name}>
                        <span className="invalid-feedback">
                            Please enter name on card
                        </span>
                    </RenderOnCondition>
                </div>
                <div className="form-row">
                    <label className="form-label form-label__form--medium">
                        Name on card
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
                <RenderOnCondition condition={!isEmpty(cardDetail.expiryDate)}>
                    <div className="form-row mt-3">
                        <label className="form-label form-label__form--medium">
                            Valid Thru
                        </label>
                        <DatePicker
                            selected={converExpiryDateToJsDate(cardDetail.expiryDate)}
                            onChange={handleExpiryChange}
                            showYearDropdown
                            dateFormat="MM/yyyy"
                        />
                        <RenderOnCondition
                            condition={errorCardDetail.expiryDate}
                        >
                            <span className="react-date-input__invalid">
                                Please enter valid expiry date
                            </span>
                        </RenderOnCondition>
                    </div>
                </RenderOnCondition>
                <div className="form-row row mt-3">
                    <div className="form-row col-6">
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
                            onChange={handleCvvChange}
                            onBlur={handleonBlurCvvChange}
                            type="text"
                            className={`form-control ${
                                errorCardDetail.cvv ? "is-invalid" : ""
                            }`}
                            placeholder="XXXX"
                            name="cvv"
                            value={cardDetail.cvv ?? ""}
                        />
                        <RenderOnCondition condition={errorCardDetail.cvv}>
                            <span className="invalid-feedback">
                                Please enter valid cvv
                            </span>
                        </RenderOnCondition>
                    </div>
                    <div className="form-row col-6">
                        <label className="form-label form-label__form--medium">
                            Zip Code
                        </label>
                        <input
                            onChange={handlePostalChange}
                            onBlur={handleOnBlurPostal}
                            type="text"
                            className={`form-control ${
                                errorCardDetail.postal ? "is-invalid" : ""
                            }`}
                            placeholder="Enter zip code"
                            name="postal"
                            value={cardDetail.postal ?? ""}
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
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    onClick={handleOnEditCardSubmit}
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
)(EditCardModalComponent);
