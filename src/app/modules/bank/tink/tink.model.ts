import mongoose, { Schema } from "mongoose";
import { IBankTransaction } from "./tink.interface";

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    tId: { type: String, required: true, unique: true },
    accId: { type: String, required: true },
    amount: {
      value: {
        unscaledValue: { type: String, required: true },
        scale: { type: String, required: true },
      },
      currencyCode: { type: String, required: true },
    },
    descriptions: {
      display: { type: String, required: true },
    },
    status: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

export const BankTransaction = mongoose.model<IBankTransaction>(
  "BankTransaction",
  BankTransactionSchema
);
