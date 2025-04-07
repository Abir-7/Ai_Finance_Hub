import { Schema, model } from "mongoose";
import { INotification } from "./notification.interface";

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
    image: {
      type: String,
      required: false, // optional if some don't include image
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);
