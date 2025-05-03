import { Schema, model } from "mongoose";
import { INotification } from "./notification.interface";
import { categories } from "../finance/expense/expense.interface";

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    category: { type: String, enum: categories, required: true },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
