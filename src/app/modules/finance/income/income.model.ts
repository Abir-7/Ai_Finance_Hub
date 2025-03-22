import mongoose, { Schema } from "mongoose";
import { IIncome, method, source } from "./income.interface";

const IncomeSchema = new Schema<IIncome>(
  {
    amount: { type: Number, required: true },
    source: { type: String, enum: source, required: true },
    method: { type: String, enum: method, required: true },
    note: { type: String },
    description: {
      images: [{ type: String }],
      info: { type: String, required: true },
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Income = mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
