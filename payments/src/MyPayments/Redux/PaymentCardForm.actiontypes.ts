import { AddCardResult } from "src/Payments/Models";
import {
    RemovePaymentCardResult,
    SetDefaultPaymentCardResult,
} from "../Models";

export const SetDefaultPaymentCardType = "SET_PAYMENT_CARD_DEFAULT";
export const AddPaymentCardType = "ADD_PAYMENT_CARD";
export const EditPaymentCardType = "EDIT_PAYMENT_CARD";
export const RemovePaymentCardType = "REMOVE_PAYMENT_CARD";
export const RequestPaymentCardFormType = "REQUEST_PAYMENT_CARD_FORM";
export const ResetPaymentCardFormType = "RESET_PAYMENT_FORM";
export const ResetUpdatePaymentCardFormType = "RESET_UPDATED_PAYMENT_FORM";
export const ResetDeleltePaymentCardFormType = "RESET_DELETED_PAYMENT_FORM";
export const ResetCreatePaymentCardFormType = "RESET_CREATED_PAYMENT_FORM";

export interface SetDefaultPaymentCard {
    type: "SET_PAYMENT_CARD_DEFAULT";
    payload: SetDefaultPaymentCardResult;
}

export interface RemovePaymentCard {
    type: "REMOVE_PAYMENT_CARD";
    payload: RemovePaymentCardResult;
}

export interface AddPaymentCard {
    type: "ADD_PAYMENT_CARD";
    payload: AddCardResult;
}

export interface EditPaymentCard {
    type: "EDIT_PAYMENT_CARD";
    payload: AddCardResult;
}

export interface RequestPaymentCardForm {
    type: "REQUEST_PAYMENT_CARD_FORM";
}

export interface ResetUpdatePaymentCardForm {
    type: "RESET_UPDATED_PAYMENT_FORM";
}
export interface ResetDeleltePaymentCardForm {
    type: "RESET_DELETED_PAYMENT_FORM";
}

export interface ResetCreatePaymentCardFormType {
    type: "RESET_CREATED_PAYMENT_FORM";
}

export interface ResetPaymentCardForm {
    type: "RESET_PAYMENT_FORM";
}

export type PaymentCardFormAction =
    | SetDefaultPaymentCard
    | AddPaymentCard
    | EditPaymentCard
    | RemovePaymentCard
    | ResetDeleltePaymentCardForm
    | RequestPaymentCardForm
    | ResetUpdatePaymentCardForm
    | ResetCreatePaymentCardFormType
    | ResetPaymentCardForm;
