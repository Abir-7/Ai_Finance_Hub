/* eslint-disable arrow-body-style */
import { Types } from "mongoose";
import { INotification } from "./notification.interface";
import { Notification } from "./notification.model";

const createNotification = async (
  notificationData: INotification
): Promise<INotification> => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

// Get all notifications
const getAllNotifications = async (): Promise<INotification[]> => {
  return await Notification.find().sort({ createdAt: -1 }).exec(); // Sort by newest first
};

// Get a single notification by ID
const getNotificationById = async (
  notificationId: Types.ObjectId
): Promise<INotification | null> => {
  return await Notification.findById(notificationId).exec();
};

// Update a notification by ID
const updateNotification = async (
  notificationId: Types.ObjectId,
  updateData: Partial<INotification>
): Promise<INotification | null> => {
  return await Notification.findByIdAndUpdate(notificationId, updateData, {
    new: true,
  }).exec();
};

// Delete a notification by ID
const deleteNotification = async (
  notificationId: Types.ObjectId
): Promise<void> => {
  await Notification.findByIdAndDelete(notificationId).exec();
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
