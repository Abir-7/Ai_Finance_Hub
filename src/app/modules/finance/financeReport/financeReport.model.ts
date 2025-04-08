import { Schema, model } from "mongoose";
import { IPresentMonthData } from "./financeReport.interface";

const PresentMonthDataSchema = new Schema<IPresentMonthData>(
  {
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    availableMoney: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

export const PresentMonthData = model<IPresentMonthData>(
  "PresentMonthData",
  PresentMonthDataSchema
);
