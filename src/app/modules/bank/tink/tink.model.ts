import mongoose, { Schema } from "mongoose";
import { IBankTransaction } from "./tink.interface";

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    id: { type: String, required: true, unique: true },
    accountId: { type: String, required: true },
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
