import { Types } from "mongoose";

export interface IUserExpensePlan {
  balance: {
    avgIncome: number;
    avgExpense: number;
  };
  expenseLimit: {
    foodDining: number;
    transportation: number;
    health: number;
    entertainment: number;
    shopping: number;
    education: number;
    travel: number;
    rent: number;
    personalCare: number;
    insurance: number;
    Other: number;
  };
  user: Types.ObjectId;
}
