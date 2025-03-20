import mongoose, { Schema } from "mongoose";
import { categories, IExpense, method } from "./expense.interface";

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: categories, required: true },
    method: { type: String, enum: method, required: true },
    note: { type: String },
    description: {
      image: { type: String, required: true },
      info: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const ExpenseModel = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default ExpenseModel;
