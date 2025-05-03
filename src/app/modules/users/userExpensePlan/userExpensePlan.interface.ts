import { Types } from "mongoose";

export interface IUserExpensePlan {
  balance: {
    avgIncome: number;
    avgExpense: number;
  };
  expenseLimit: {
    food: number;
    social: number;
    pets: number;
    education: number;
    gift: number;
    transport: number;
    rent: number;
    apparel: number;
    beauty: number;
    health: number;
    other: number;
  };
  user: Types.ObjectId;
}

export const categories = [
  "food",
  "social",
  "pets",
  "education",
  "gift",
  "transport",
  "rent",
  "apparel",
  "beauty",
  "health",
  "other",
  "shopping",
  "groceries",
  "housing",
  "entertainment",
  "bills",
  "utilities",
  "sports",
  "fuel",
] as const;

export type TCategory = (typeof categories)[number];
