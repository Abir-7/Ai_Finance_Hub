import mongoose, { Schema } from "mongoose";
import { IUserExpensePlan } from "./userExpensePlan.interface";

const userExpensePlanSchema = new Schema<IUserExpensePlan>(
  {
    balance: {
      income: { type: Number, required: true },
      expense: { type: Number, required: true },
    },
    expenseLimit: {
      food: { type: Number, required: true },
      apparel: { type: Number, required: true },
      rent: { type: Number, required: true },
      transport: { type: Number, required: true },
      health: { type: Number, required: true },
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
