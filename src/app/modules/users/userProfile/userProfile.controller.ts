import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { UserProfileService } from "./userProfile.service";

const updateUserProfileImage = catchAsync(async (req, res) => {
  const filePath = req.file?.path;
  const result = await UserProfileService.updateUserProfileImage(
    filePath as string,
    req.user.userEmail
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User Profile image changed successfully.",
    data: result,
  });
});

const updateUserProfileData = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await UserProfileService.updateUserProfileData(
    userData,
    req.user.userEmail
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User Profile info updated successfully.",
    data: result,
  });
});

export const UserProfileController = {
  updateUserProfileData,
  updateUserProfileImage,
};
