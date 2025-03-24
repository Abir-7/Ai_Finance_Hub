import { Types } from "mongoose";
import { TCategory } from "../../users/userExpensePlan/userExpensePlan.interface";

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
