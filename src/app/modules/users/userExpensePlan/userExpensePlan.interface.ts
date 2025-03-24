import { Types } from "mongoose";

export interface IUserExpensePlan {
  balance: {
    income: number;
    expense: number;
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
  "social Life",
  "pets",
  "education",
  "gift",
  "transport",
  "rent",
  "apparel",
  "beauty",
  "health",
  "other",
] as const;

export type TCategory = (typeof categories)[number];
