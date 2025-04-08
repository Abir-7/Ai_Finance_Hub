import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middleware/auth/auth";

const router = Router();
router.post("/", auth("USER"), NotificationController.createNotification);
router.get("/", auth("USER"), NotificationController.getAllNotifications);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);

export const NotificationRouter = router;
