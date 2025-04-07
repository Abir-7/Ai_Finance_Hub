import { Router } from "express";
import { NotificationController } from "./notification.controller";

const router = Router();
router.post("/", NotificationController.createNotification);
router.get("/", NotificationController.getAllNotifications);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);

export const NotificationRouter = router;
