import { Router } from "express";

import { SubscriptionController } from "./subscription.controller";
import { auth } from "../../middleware/auth/auth";

const router = Router();

router.post("/", auth("USER"), SubscriptionController.createSubscription);

export const SubscriptionRoute = router;
