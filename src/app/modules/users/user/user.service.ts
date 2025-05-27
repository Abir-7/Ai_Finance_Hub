/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable arrow-body-style */
import getExpiryTime from "../../../utils/helper/getExpiryTime";
import getHashedPassword from "../../../utils/helper/getHashedPassword";
import getOtp from "../../../utils/helper/getOtp";
import logger from "../../../utils/logger";
import { sendEmail } from "../../../utils/sendEmail";
import { TinkCountryCode } from "../userProfile/userProfile.interface";

import { UserProfile } from "../userProfile/userProfile.model";

import { IUser } from "./user.interface";
import User from "./user.model";

const createUser = async (data: {
  country: TinkCountryCode;
  email: string;
  fullName: string;
  password: string;
}): Promise<Partial<IUser>> => {
  const hashedPassword = await getHashedPassword(data.password);
  const otp = getOtp(4);
  const expDate = getExpiryTime(10);

  //user data
  const userData = {
    email: data.email,
    password: hashedPassword,
    authentication: { otp, expDate },
  };
  const createdUser = await User.create(userData);

  //user profile data
  const userProfileData = {
    fullName: data.fullName,
    email: createdUser.email,
    user: createdUser._id,
    ...(data.country && data.country !== "NONE" && { country: data.country }),
  };
  await UserProfile.create(userProfileData);
  await sendEmail(
    data.email,
    "Email Verification Code",
    `Your code is: ${otp}`
  );
  return { email: createdUser.email, isVerified: createdUser.isVerified };
};

const getAllUser = async () => {
  logger.info("hit");
  return await UserProfile.find().populate("user");
};

export const UserService = {
  createUser,
  getAllUser,
};
