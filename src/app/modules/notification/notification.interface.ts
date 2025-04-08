import { Types } from "mongoose";
import { TCategory } from "../users/userExpensePlan/userExpensePlan.interface";

export interface INotification {
  title: string;
  description: string;
  category: TCategory;
  user: Types.ObjectId;
}
