import status from "http-status";
import AppError from "../../../errors/AppError";
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";

import { UserProfile } from "./userProfile.model";
import { removeFalsyFields } from "../../../utils/helper/removeFalsyField";
import { IUserProfile } from "./userProfile.interface";
import { IAuthData } from "../../../interface/auth.interface";

const updateUserProfileImage = async (
  path: string,
  email: string
): Promise<IUserProfile | null> => {
  const image = getRelativePath(path);

  const updated = await UserProfile.findOneAndUpdate(
    { email: email },
    { image },
    { new: true }
  );

  if (!updated) {
    throw new AppError(status.BAD_REQUEST, "Failed to update image.");
  }

  return updated;
};

const updateUserProfileData = async (
  userdata: Partial<IUserProfile>,
  user: IAuthData
): Promise<IUserProfile | null> => {
  const data = removeFalsyFields(userdata);

  const email = user.userEmail;
  console.log(user, email, "____________________________");
  const updated = await UserProfile.findOneAndUpdate({ email: email }, data, {
    new: true,
  });

  console.log(updated);

  if (!updated) {
    throw new AppError(status.BAD_REQUEST, "Failed to update user info.");
  }

  return updated;
};

export const UserProfileService = {
  updateUserProfileData,
  updateUserProfileImage,
};
