import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";
import status from "http-status";
import { Types } from "mongoose";

// Create a new notification
const createNotification = catchAsync(async (req: Request, res: Response) => {
  const notificationData = req.body;
  const result = await NotificationService.createNotification(
    notificationData,
    req.user.userId
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: status.CREATED,
    message: "Notification created successfully.",
  });
});

// Get all notifications
const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getAllNotifications(req.user.userId);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: status.OK,
    message: "Notifications fetched successfully.",
  });
});

// Get a single notification by ID
const getNotificationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NotificationService.getNotificationById(
    new Types.ObjectId(id)
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: status.OK,
    message: "Notification fetched successfully.",
  });
});

// Update a notification by ID
const updateNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await NotificationService.updateNotification(
    new Types.ObjectId(id),
    updateData
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: status.OK,
    message: "Notification updated successfully.",
  });
});

// Delete a notification by ID
const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await NotificationService.deleteNotification(new Types.ObjectId(id));
  sendResponse(res, {
    data: null,
    success: true,
    statusCode: status.NO_CONTENT,
    message: "Notification deleted successfully.",
  });
});

export const NotificationController = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
