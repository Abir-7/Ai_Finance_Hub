import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
router.patch("/verify-user", AuthController.verifyUser);
router.patch("/forgot-password-request", AuthController.forgotPasswordRequest);
router.patch("/reset-password");
export const AuthRoute = router;
