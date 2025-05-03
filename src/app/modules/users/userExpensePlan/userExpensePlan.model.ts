import mongoose, { Schema } from "mongoose";
import { IUserExpensePlan } from "./userExpensePlan.interface";

const userExpensePlanSchema = new Schema<IUserExpensePlan>(
  {
    balance: {
      avgIncome: { type: Number, default: 0 },
      avgExpense: { type: Number, default: 0 },
    },
    expenseLimit: {
      foodDining: { type: Number, default: 0 },
      transportation: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      travel: { type: Number, default: 0 },
      rent: { type: Number, default: 0 },
      personalCare: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      Other: { type: Number, default: 0 },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const UserExpensePlan = mongoose.model<IUserExpensePlan>(
  "UserBalancePlan",
  userExpensePlanSchema
);

export default UserExpensePlan;
