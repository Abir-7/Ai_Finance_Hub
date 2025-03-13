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
    message: "User successfully  created",
    data: result,
  });
});
export const UserController = { createUser };
