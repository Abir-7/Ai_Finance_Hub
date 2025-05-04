import { model, Schema } from "mongoose";
import { ISavings } from "./savings.interface";

const SavingsSchema = new Schema<ISavings>(
  {
    tId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    accId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Savings = model<ISavings>("Savings", SavingsSchema);
