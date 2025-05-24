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
const addExpenseByVoice = catchAsync(async (req, res) => {
  const result = await ExpenseService.addExpenseByVoice(
    req.body.promt,
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

const editExpenseCategory = catchAsync(async (req, res) => {
  const expenseId = req.params.id;
  const result = await ExpenseService.editExpeseCategory(
    expenseId,
    req.body.category
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Expense category has been successfully updated",
    data: result,
  });
});

const getCurrentMonthExpense = catchAsync(async (req, res) => {
  const result = await ExpenseService.getCurrentMonthExpense(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User current month expense data successfully fetched",
    data: result,
  });
});

export const ExpenseController = {
  addExpense,
  addExpenseByVoice,
  getExpenseDataByDate,
  getCurrentMonthExpense,
  editExpenseCategory,
};
