/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errors/AppError";
import User from "../users/user/user.model";
import { jsonWebToken } from "../../utils/jwt/jwt";
import { UserProfile } from "../users/userProfile/userProfile.model";
import getExpiryTime from "../../utils/helper/getExpiryTime";
import getOtp from "../../utils/helper/getOtp";
import { sendEmail } from "../../utils/sendEmail";
import getHashedPassword from "../../utils/helper/getHashedPassword";
import { appConfig } from "../../config";
const userLogin = async (loginData) => {
    const userData = await User.findOne({ email: loginData.email }).select("+password");
    if (!userData) {
        throw new AppError(status.BAD_REQUEST, "Please check your email");
    }
    if (userData.isVerified === false) {
        throw new AppError(status.BAD_REQUEST, "Please verify your email.");
    }
    const isPassMatch = await userData.comparePassword(loginData.password);
    if (!isPassMatch) {
        throw new AppError(status.BAD_REQUEST, "Please check your password.");
    }
    const jwtPayload = {
        userEmail: userData.email,
        userId: userData._id,
        userRole: userData.role,
    };
    const accessToken = jsonWebToken.generateToken(jwtPayload, appConfig.jwt.jwt_access_secret, appConfig.jwt.jwt_access_exprire);
    const refreshToken = jsonWebToken.generateToken(jwtPayload, appConfig.jwt.jwt_refresh_secret, appConfig.jwt.jwt_refresh_exprire);
    return {
        accessToken,
        refreshToken,
        userData: Object.assign(Object.assign({}, userData.toObject()), { password: null }),
    };
};
const verifyUser = async (email, otp) => {
    if (!otp) {
        throw new AppError(status.BAD_REQUEST, "Give the Code. Check your email.");
    }
    const user = (await UserProfile.findOne({ email }).populate("user"));
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
        token = jsonWebToken.generateToken({ userEmail: user.email }, appConfig.jwt.jwt_access_secret, "10m");
        const expDate = getExpiryTime(10);
        updatedUser = await User.findOneAndUpdate({ email: user.email }, {
            "authentication.otp": null,
            "authentication.expDate": expDate,
            "authentication.needToResetPass": true,
            "authentication.token": token,
        }, { new: true });
    }
    else {
        updatedUser = await User.findOneAndUpdate({ email: user.email }, {
            "authentication.otp": null,
            "authentication.expDate": null,
            isVerified: true,
        }, { new: true });
    }
    return {
        userId: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
        email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
        isVerified: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isVerified,
        needToResetPass: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.needToResetPass,
        token: token,
    };
};
const forgotPasswordRequest = async (email) => {
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
    await sendEmail(user.email, "Reset Password Verification Code", `Your code is: ${otp}`);
    await User.findOneAndUpdate({ email }, { authentication: data }, { new: true });
    return { email: user.email };
};
const resetPassword = async (token, userData) => {
    const { new_password, confirm_password } = userData;
    if (!token) {
        throw new AppError(status.BAD_REQUEST, "You are not allowed to reset password.");
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
        throw new AppError(status.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const decode = jsonWebToken.verifyJwt(token, appConfig.jwt.jwt_access_secret);
    const hassedPassword = await getHashedPassword(new_password);
    const updateData = await User.findOneAndUpdate({ email: decode.userEmail }, {
        password: hassedPassword,
        authentication: { opt: null, token: null, expDate: null },
    }, { new: true });
    if (!updateData) {
        throw new AppError(status.BAD_REQUEST, "Failed to reset password. Try again.");
    }
    return { email: updateData === null || updateData === void 0 ? void 0 : updateData.email };
};
const getNewAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, "Refresh token not found.");
    }
    const decode = jsonWebToken.verifyJwt(refreshToken, appConfig.jwt.jwt_refresh_secret);
    const { userEmail, userId, userRole } = decode;
    if (userEmail && userId && userRole) {
        const jwtPayload = {
            userEmail: userEmail,
            userId: userId,
            userRole: userRole,
        };
        const accessToken = jsonWebToken.generateToken(jwtPayload, appConfig.jwt.jwt_access_secret, appConfig.jwt.jwt_access_exprire);
        return { accessToken };
    }
    else {
        throw new AppError(status.UNAUTHORIZED, "You are unauthorized.");
    }
};
const updatePassword = async (userId, passData) => {
    const { new_password, confirm_password, old_password } = passData;
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }
    const isPassMatch = await user.comparePassword(old_password);
    if (!isPassMatch) {
        throw new AppError(status.BAD_REQUEST, "Old password not matched.");
    }
    if (new_password !== confirm_password) {
        throw new AppError(status.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const hassedPassword = await getHashedPassword(new_password);
    if (!hassedPassword) {
        throw new AppError(status.BAD_REQUEST, "Failed to update password. Try again.");
    }
    user.password = hassedPassword;
    await user.save();
    return { user: user.email, message: "Password successfully updated." };
};
export const AuthService = {
    userLogin,
    verifyUser,
    forgotPasswordRequest,
    resetPassword,
    getNewAccessToken,
    updatePassword,
};
