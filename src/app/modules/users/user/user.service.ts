import getExpiryTime from "../../../utils/helper/getExpiryTime";
import getHashedPassword from "../../../utils/helper/getHashedPassword";
import getOtp from "../../../utils/helper/getOtp";
import { UserProfile } from "../userProfile/userProfile.model";

import { IUser } from "./user.interface";
import User from "./user.model";

const createUser = async (data: {
  email: string;
  fullName: string;
  password: string;
}): Promise<IUser> => {
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
  const userProfileData = { fullName: data.fullName };
  await UserProfile.create(userProfileData);

  return createdUser;
};

export const UserService = { createUser };
