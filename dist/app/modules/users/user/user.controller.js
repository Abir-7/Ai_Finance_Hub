import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { UserService } from "./user.service";
const createUser = catchAsync(async (req, res) => {
    const userData = req.body;
    const result = await UserService.createUser(userData);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "User successfully created.Check your email for code.",
        data: result,
    });
});
const updateProfileImage = catchAsync(async (req, res) => {
    var _a;
    const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const result = await UserService.updateProfileImage(filePath);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Profile image changed successfully.",
        data: result,
    });
});
export const UserController = { createUser, updateProfileImage };
