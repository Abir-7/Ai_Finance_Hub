import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
router.post("/login", AuthController.userLogin);
router.patch("/verify-user", AuthController.verifyUser);
router.patch("/forgot-password-request", AuthController.forgotPasswordRequest);
router.patch("/reset-password", AuthController.resetPassword);
export const AuthRoute = router;
