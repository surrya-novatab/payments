export interface PaymentCard {
  createdDate: string;
  defaultAccount: boolean;
  _id: string;
  accountType: string;
  cardEndingNumber: string;
  postal:string;
  expiryDate: string;
  partnerId: string;
  name: string;
  refId: string;
  cvv?:string
}
