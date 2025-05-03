import { Types } from "mongoose";
import { TCategory } from "../finance/expense/expense.interface";

export interface INotification {
  title: string;
  description: string;
  category: TCategory;
  user: Types.ObjectId;
}
