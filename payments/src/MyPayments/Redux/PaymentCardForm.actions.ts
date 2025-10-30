import { AppThunkAction } from "src/Configs/Store";
import { AddCardPayload, UpdateCardPayload } from "src/Payments/Models";
import { addCard, editCard } from "src/Payments/Service/Payment.service";
import {
  removePaymentCard,
  setDefaultPaymentCard,
} from "../Services/PaymentMethod.service";
import * as PaymentCardFormActions from "./PaymentCardForm.actiontypes";

export const paymentCardFormActions = {
  setDefaultPaymentCard:
    (
      resturantRefId: string,
      paymentCardRefId: string
    ): AppThunkAction<
      | PaymentCardFormActions.SetDefaultPaymentCard
      | PaymentCardFormActions.RequestPaymentCardForm
    > =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.RequestPaymentCardFormType,
      });
      const response = await setDefaultPaymentCard(
        resturantRefId,
        paymentCardRefId
      );
      dispatch({
        type: PaymentCardFormActions.SetDefaultPaymentCardType,
        payload: response,
      });
    },
  addPaymentCard:
    (
      cardPayload: AddCardPayload,
      resturantRefId: string
    ): AppThunkAction<
      | PaymentCardFormActions.AddPaymentCard
      | PaymentCardFormActions.RequestPaymentCardForm
    > =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.RequestPaymentCardFormType,
      });
      const response = await addCard(cardPayload, resturantRefId);
      dispatch({
        type: PaymentCardFormActions.AddPaymentCardType,
        payload: response,
      });
    },
  editPaymentCard:
    (
      cardPayload: UpdateCardPayload,
      resturantRefId: string,
      paymentCardRefId: string
    ): AppThunkAction<
      | PaymentCardFormActions.EditPaymentCard
      | PaymentCardFormActions.RequestPaymentCardForm
    > =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.RequestPaymentCardFormType,
      });
      const response = await editCard(
        cardPayload,
        resturantRefId,
        paymentCardRefId
      );
      dispatch({
        type: PaymentCardFormActions.EditPaymentCardType,
        payload: response,
      });
    },
  removePaymentCard:
    (
      resturantRefId: string,
      paymentCardRefId: string
    ): AppThunkAction<
      | PaymentCardFormActions.RemovePaymentCard
      | PaymentCardFormActions.RequestPaymentCardForm
    > =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.RequestPaymentCardFormType,
      });
      const response = await removePaymentCard(
        resturantRefId,
        paymentCardRefId
      );
      dispatch({
        type: PaymentCardFormActions.RemovePaymentCardType,
        payload: response,
      });
    },
  resetUpdatePaymentForm:
    (): AppThunkAction<PaymentCardFormActions.ResetUpdatePaymentCardForm> =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.ResetUpdatePaymentCardFormType,
      });
    },
  resetDeletePaymentForm:
    (): AppThunkAction<PaymentCardFormActions.ResetDeleltePaymentCardForm> =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.ResetDeleltePaymentCardFormType,
      });
    },
  resetCreatePaymentForm:
    (): AppThunkAction<PaymentCardFormActions.ResetCreatePaymentCardFormType> =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.ResetCreatePaymentCardFormType,
      });
    },
    resetPaymentForm:
    (): AppThunkAction<PaymentCardFormActions.ResetPaymentCardForm> =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardFormActions.ResetPaymentCardFormType,
      });
    },
};
