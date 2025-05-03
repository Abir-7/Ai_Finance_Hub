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

export const sources = [
  "salary",
  "freelance",
  "investments",
  "gifts",
  "refunds",
  "other",
] as const;
type TSource = (typeof sources)[number];

export const method = ["cash", "bank"] as const;
export type TMethod = (typeof method)[number];
