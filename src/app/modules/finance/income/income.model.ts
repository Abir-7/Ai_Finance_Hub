/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from "mongoose";
import { IIncome, method, sources } from "./income.interface";

const IncomeSchema = new Schema<IIncome>(
  {
    amount: { type: Number, required: true },
    source: { type: String, enum: sources, required: true },
    method: { type: String, enum: method, required: true },
    note: { type: String },
    description: {
      images: [{ type: String }],
      info: { type: String, required: true },
    },
    tId: { type: String, unique: true, sparse: true },
    accId: { type: String, default: null },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Income = mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
