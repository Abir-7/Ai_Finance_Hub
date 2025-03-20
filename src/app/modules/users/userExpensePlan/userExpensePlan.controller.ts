import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

import { UserExpensePlanService } from "./userExpensePlan.service";

const addUserExpencePlan = catchAsync(async (req, res) => {
  const result = await UserExpensePlanService.addUserExpencePlan(
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

const updateUserExpencePlan = catchAsync(async (req, res) => {
  const result = await UserExpensePlanService.updateUserExpencePlan(
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

export const UserExpensePlanController = {
  addUserExpencePlan,
  updateUserExpencePlan,
};
