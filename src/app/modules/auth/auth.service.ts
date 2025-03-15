/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errors/AppError";
import User from "../users/user/user.model";

import { jsonWebToken } from "../../utils/jwt/jwt";
import { appConfig } from "../../config";
import { UserProfile } from "../users/userProfile/userProfile.model";
import getExpiryTime from "../../utils/helper/getExpiryTime";
import getOtp from "../../utils/helper/getOtp";
import { sendEmail } from "../../utils/sendEmail";
import getHashedPassword from "../../utils/helper/getHashedPassword";

const userLogin = async (loginData: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; userData: any }> => {
  const userData = await User.findOne({ email: loginData.email }).select(
    "+password"
  );

  if (!userData) {
    throw new AppError(status.BAD_REQUEST, "Please check your email");
  }

  if (userData.isVerified === false) {
    throw new AppError(status.BAD_REQUEST, "Please verify your email.");
  }

  const isPassMatch = await userData.comparePassword(
    loginData.password,
    userData.password
  );

  if (!isPassMatch) {
    throw new AppError(status.BAD_REQUEST, "Please check your password.");
  }

  const jwtPayload = {
    userEmail: userData.email,
    userId: userData._id,
    userRole: userData.role,
  };

  const accessToken = jsonWebToken.generateToken(
    jwtPayload,
    appConfig.jwt.jwt_access_secret as string,
    appConfig.jwt.jwt_access_exprire
  );

  return {
    accessToken,
    userData: {
      ...userData,
      password: null,
    },
  };
};

const verifyUser = async (
  email: string,
  otp: number
): Promise<{
  userId: string | undefined;
  email: string | undefined;
  isVerified: boolean | undefined;
  needToResetPass: boolean | undefined;
  token: string | null;
}> => {
  if (!otp) {
    throw new AppError(status.BAD_REQUEST, "Give the Code. Check your email.");
  }
  const user = (await UserProfile.findOne({ email }).populate("user")) as any;
  if (!user) {
    throw new AppError(status.BAD_REQUEST, "User not found");
  }

  const currentDate = new Date();
  const expirationDate = new Date(user.user.authentication.expDate);

  if (currentDate > expirationDate) {
    throw new AppError(status.BAD_REQUEST, "Code time expired.");
  }

  if (otp !== user.user.authentication.otp) {
    throw new AppError(status.BAD_REQUEST, "Code not matched.");
  }

  let updatedUser;
  let token = null;
  if (user.user.isVerified) {
    token = jsonWebToken.generateToken(
      { email: user.email },
      appConfig.jwt.jwt_access_secret as string,
      "10m"
    );

    const expDate = getExpiryTime(10);

    updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        "authentication.otp": null,
        "authentication.expDate": expDate,
        "authentication.needToResetPass": true,
        "authentication.token": token,
      },
      { new: true }
    );
  } else {
    updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        "authentication.otp": null,
        "authentication.expDate": null,
        isVerified: true,
      },
      { new: true }
    );
  }

  return {
    userId: updatedUser?._id as string,
    email: updatedUser?.email,
    isVerified: updatedUser?.isVerified,
    needToResetPass: updatedUser?.needToResetPass,
    token: token,
  };
};

const forgotPasswordRequest = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(status.BAD_REQUEST, "Email not found.");
  }

  const otp = getOtp(4);
  const expDate = getExpiryTime(10);

  const data = {
    otp: otp,
    expDate: expDate,
    needToResetPass: false,
    token: null,
  };

  await sendEmail(
    user.email,
    "Reset Password Verification Code",
    `Your code is: ${otp}`
  );

  await User.findOneAndUpdate(
    { email },
    { authentication: data },
    { new: true }
  );

  return { email: user.email };
};

const resetPassword = async (
  token: string,
  userData: {
    new_password: string;
    confirm_password: string;
  }
) => {
  const { new_password, confirm_password } = userData;

  if (!token) {
    throw new AppError(
      status.BAD_REQUEST,
      "You are not allowed to reset password."
    );
  }

  const user = await User.findOne({ "authentication.token": token });
  if (!user) {
    throw new AppError(status.BAD_REQUEST, "User not found.");
  }

  const currentDate = new Date();
  const expirationDate = new Date(user.authentication.expDate);

  if (currentDate > expirationDate) {
    throw new AppError(status.BAD_REQUEST, "Token expired.");
  }

  if (new_password !== confirm_password) {
    throw new AppError(
      status.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const decode = jsonWebToken.verifyJwt(
    token,
    appConfig.jwt.jwt_access_secret as string
  );

  const hassedPassword = await getHashedPassword(new_password);
  const updateData = await User.findOneAndUpdate(
    { email: decode.userEmail },
    {
      password: hassedPassword,
      authentication: { opt: null, token: null, expDate: null },
    },
    { new: true }
  );

  return { user: { email: updateData?.email } };
};

export const AuthService = {
  userLogin,
  verifyUser,
  forgotPasswordRequest,
  resetPassword,
};
