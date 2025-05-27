/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from "mongoose";

import { categories, IExpense, method } from "./expense.interface";

const ExpenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true },
    category: { type: String, enum: categories, required: true },
    method: { type: String, enum: method, required: true },
    note: { type: String },
    description: {
      images: [{ type: String }],
      info: { type: String, required: true },
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tId: { type: String, unique: true, sparse: true },
    accId: { type: String, default: null },
  },
  { timestamps: true }
);

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
