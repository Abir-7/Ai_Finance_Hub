import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

import { UserExpensePlanService } from "./userExpensePlan.service";

const addUserExpencePlan = catchAsync(async (req, res) => {
  const result = await UserExpensePlanService.addUserExpensePlan(
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User ExpencePlan added successfully.",
    data: result,
  });
});

const updateUserExpensePlan = catchAsync(async (req, res) => {
  const result = await UserExpensePlanService.updateUserExpensePlan(
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User ExpencePlan updated successfully.",
    data: result,
  });
});

const getUserExpenseLimit = catchAsync(async (req, res) => {
  const result = await UserExpensePlanService.getUserExpenseLimit(
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User Expence limit fetched successfully.",
    data: result,
  });
});

export const UserExpensePlanController = {
  addUserExpencePlan,
  updateUserExpensePlan,
  getUserExpenseLimit,
};
