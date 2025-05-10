import { Types } from "mongoose";

export interface IExpense {
  amount: number;
  category: TCategory;
  method: TMethod;
  note?: string;
  description: {
    images?: string[];
    info: string;
  };
  user: Types.ObjectId;
  tId?: string;
  accId?: string;
}

export const method = ["cash", "card"] as const;
type TMethod = (typeof method)[number];

export const categories = [
  "food_dining",
  "transportation",
  "utilities",
  "health_medical",
  "entertainment",
  "shopping",
  "education",
  "travel",
  "rent_mortgage",
  "personal_care",
  "insurance",
  "transfer",
  "other",
] as const;

export type TCategory = (typeof categories)[number];
