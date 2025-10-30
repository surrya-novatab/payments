import { AppThunkAction } from "src/Configs/Store";
import { getPaymentCardListing } from "../Services/PaymentMethod.service";
import * as PaymentCardListingActions from "./PaymentCardListing.actiontypes";

export const paymentCardListingActions = {
  getPaymentCardListing:
    (
      resturantRefId: string
    ): AppThunkAction<
      | PaymentCardListingActions.GetPaymentCardListing
      | PaymentCardListingActions.RequestPaymentCardListing
    > =>
    async (dispatch) => {
      dispatch({
        type: PaymentCardListingActions.RequestPaymentCardListingType,
      });
      const response = await getPaymentCardListing(resturantRefId);
      dispatch({
        type: PaymentCardListingActions.GetPaymentCardListingType,
        payload: response,
      });
    },
};
