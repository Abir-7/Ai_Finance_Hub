/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from "mongoose";
import { IIncome, method, source } from "./income.interface";
import { PresentMonthData } from "../financeReport/financeReport.model";
import dayjs from "dayjs";
import logger from "../../../utils/logger";

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

IncomeSchema.post("save", async function (doc, next) {
  try {
    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    await PresentMonthData.findOneAndUpdate(
      {
        user: doc.user,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
      {
        $inc: { totalIncome: doc.amount, availableMoney: doc.amount },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    next();
  } catch (err: any) {
    logger.error("Error in income post-save:", err);
    next(err as mongoose.CallbackError);
  }
});

const Income = mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
