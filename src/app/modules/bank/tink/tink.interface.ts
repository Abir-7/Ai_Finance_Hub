import { Types } from "mongoose";

export interface IBankTransaction {
  id: string;
  accountId: string;
  amount: {
    value: {
      unscaledValue: string;
      scale: string;
    };
    currencyCode: string;
  };
  descriptions: {
    display: string;
  };
  status: string;
  user: Types.ObjectId;
}
