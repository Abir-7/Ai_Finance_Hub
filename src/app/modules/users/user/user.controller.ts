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

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUser();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All user are fetched. ",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUser,
};
