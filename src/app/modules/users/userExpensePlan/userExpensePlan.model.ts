import mongoose, { Schema } from "mongoose";
import { IUserExpensePlan } from "./userExpensePlan.interface";

const userExpensePlanSchema = new Schema<IUserExpensePlan>(
  {
    balance: {
      avgIncome: { type: Number, default: 0 },
      avgExpense: { type: Number, default: 0 },
    },
    expenseLimit: {
      food_dining: { type: Number, default: 0 },
      transportation: { type: Number, default: 0 },
      utilities: { type: Number, default: 0 },
      health_medical: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      travel: { type: Number, default: 0 },
      rent_mortgage: { type: Number, default: 0 },
      personal_care: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
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
