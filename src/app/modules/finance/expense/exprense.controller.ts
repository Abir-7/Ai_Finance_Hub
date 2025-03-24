import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ExpenseService } from "./expense.service";

const addExpense = catchAsync(async (req, res) => {
  const result = await ExpenseService.addExpense(
    req.files as Express.Multer.File[],
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User expense data successfully stored.",
    data: result,
  });
});
const getExpenseDataByDate = catchAsync(async (req, res) => {
  const result = await ExpenseService.getExpenseDataByDate(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User expense data successfully fetched",
    data: result,
  });
});

export const ExpenseController = {
  addExpense,
  getExpenseDataByDate,
};
