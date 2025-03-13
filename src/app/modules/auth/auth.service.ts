/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errors/AppError";
import User from "../users/user/user.model";

import { jsonWebToken } from "../../utils/jwt/jwt";
import { appConfig } from "../../config";

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

export const AuthService = { userLogin };
