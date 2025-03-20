import mongoose, { Schema } from "mongoose";
import { IIncome, method } from "./income.interface";

const IncomeSchema = new Schema<IIncome>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    method: { type: String, enum: method, required: true },
    note: { type: String },
    description: {
      image: { type: String, required: true },
      info: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Income = mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
