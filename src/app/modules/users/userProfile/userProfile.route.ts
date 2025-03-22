import { Router } from "express";
import { upload } from "../../../middleware/fileUpload/fileUploadHandler";
import { UserProfileController } from "./userProfile.controller";
import { auth } from "../../../middleware/auth/auth";
import zodValidator from "../../../middleware/zodValidator";
import { zodUpdateUserProfileSchema } from "./userProfile.validation";

const router = Router();

router.patch(
  "/update-profile-image",
  auth("USER"),
  upload.single("image"),
  UserProfileController.updateUserProfileImage
);

router.patch(
  "/update-profile-data",
  auth("USER"),
  zodValidator(zodUpdateUserProfileSchema),
  UserProfileController.updateUserProfileData
);

export const UserProfileRoute = router;
