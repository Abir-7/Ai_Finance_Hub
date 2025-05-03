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
}

export const method = ["cash", "card"] as const;
type TMethod = (typeof method)[number];

export const categories = [
  "food & dining",
  "transportation",
  "utilities",
  "health & medical",
  "entertainment",
  "shopping",
  "education",
  "travel",
  "rent/mortgage",
  "personal care",
  "insurance",
  "other",
] as const;

export type TCategory = (typeof categories)[number];
