import { Types } from "mongoose";

export interface IIncome {
  amount: number;
  source: TSource;
  method: TMethod;
  note?: string;
  description: {
    images?: string[];
    info: string;
  };
  user: Types.ObjectId;
}

export const source = ["salary", "prety cash", "bonus", "other"] as const;
type TSource = (typeof source)[number];

export const method = ["cash", "card"] as const;
export type TMethod = (typeof method)[number];
