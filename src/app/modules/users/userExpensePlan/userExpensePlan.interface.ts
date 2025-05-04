import { Types } from "mongoose";

export interface IUserExpensePlan {
  balance: {
    avgIncome: number;
    avgExpense: number;
  };
  expenseLimit: {
    food_dining: number;
    transportation: number;
    utilities: number;
    health_medical: number;
    entertainment: number;
    shopping: number;
    education: number;
    travel: number;
    rent_mortgage: number;
    personal_care: number;
    insurance: number;
    other: number;
  };
  user: Types.ObjectId;
}
