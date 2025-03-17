import AppError from "../../errors/AppError";
import status from "http-status";
import { jsonWebToken } from "../../utils/jwt/jwt";
import { appConfig } from "../../config";
import User from "../../modules/users/user/user.model";
export const auth = (...userRole) => async (req, res, next) => {
    const tokenWithBearer = req.headers.authorization;
    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer")) {
        return next(new AppError(status.UNAUTHORIZED, "You are not authorized"));
    }
    const token = tokenWithBearer.split(" ")[1];
    if (token === "null") {
        return next(new AppError(status.UNAUTHORIZED, "You are not authorized"));
    }
    const decodedData = jsonWebToken.verifyJwt(token, appConfig.jwt.jwt_access_secret);
    const userData = await User.findById(decodedData.userId);
    if (!userData) {
        return next(new AppError(status.UNAUTHORIZED, "You are not authorized"));
    }
    if (userRole.length && !userRole.includes(decodedData.userRole)) {
        return next(new AppError(status.UNAUTHORIZED, "You are not authorized"));
    }
    if (userData.role !== decodedData.userRole ||
        userData.email !== decodedData.userEmail) {
        return next(new AppError(status.UNAUTHORIZED, "You are not authorized"));
    }
    req.user = decodedData;
    return next();
};
