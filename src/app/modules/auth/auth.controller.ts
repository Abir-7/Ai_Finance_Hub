/* eslint-disable @typescript-eslint/no-unused-vars */
import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const verifyUser = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyUser(email, Number(otp));

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Email Successfully verified.",
    data: result,
  });
});

const forgotPasswordRequest = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const result = await AuthService.forgotPasswordRequest(email);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "A verification code is sent to your email.",
    data: result,
  });
});
const resetPassword = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  const result = await AuthService.resetPassword(token as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Password reset successfully",
    data: result,
  });
});

export const AuthController = {
  verifyUser,
  forgotPasswordRequest,
  resetPassword,
};
