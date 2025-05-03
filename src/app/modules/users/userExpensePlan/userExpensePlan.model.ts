import mongoose, { Schema } from "mongoose";
import { IUserExpensePlan } from "./userExpensePlan.interface";

const userExpensePlanSchema = new Schema<IUserExpensePlan>(
  {
    balance: {
      avgIncome: { type: Number, default: 0 },
      avgExpense: { type: Number, default: 0 },
    },
    expenseLimit: {
      food: { type: Number, default: 0 },
      apparel: { type: Number, default: 0 },
      rent: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      pets: { type: Number, default: 0 },
      gift: { type: Number, default: 0 },
      beauty: { type: Number, default: 0 },
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
