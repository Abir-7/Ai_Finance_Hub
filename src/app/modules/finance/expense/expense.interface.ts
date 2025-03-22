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
export const categories = [
  "Food",
  "Social Life",
  "Pets",
  "Education",
  "Gift",
  "Transport",
  "Rent",
  "Apparel",
  "Beauty",
  "Health",
  "Other",
] as const;

type TCategory = (typeof categories)[number];

export const method = ["cash", "card"] as const;
type TMethod = (typeof method)[number];
