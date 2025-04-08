import { Types } from "mongoose";

export interface IPresentMonthData {
  totalIncome: number;
  totalExpense: number;
  availableMoney: number;
  user: Types.ObjectId;
}
