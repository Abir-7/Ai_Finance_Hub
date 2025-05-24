import { Types } from "mongoose";

export interface IBankTransaction {
  tId: string;
  accId: string;
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
