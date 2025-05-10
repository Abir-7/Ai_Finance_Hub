import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { IncomeService } from "./income.service";

const addIncome = catchAsync(async (req, res) => {
  //   const filePath = req.file?.path;

  const result = await IncomeService.addIncome(
    req.files as Express.Multer.File[],
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User income data successfully stored.",
    data: result,
  });
});

const getIncomeDataByDate = catchAsync(async (req, res) => {
  const result = await IncomeService.getIncomeDataByDate(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User income data successfully fetched.",
    data: result,
  });
});

const getCurrentMonthIncome = catchAsync(async (req, res) => {
  const result = await IncomeService.getCurrentMonthIncome(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User current month income data successfully fetched.",
    data: result,
  });
});
const editIncomeSource = catchAsync(async (req, res) => {
  const result = await IncomeService.editIncomeSource(
    req.params.id,
    req.body.source
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Income source is successfully updated.",
    data: result,
  });
});

export const IncomeController = {
  addIncome,
  getIncomeDataByDate,
  getCurrentMonthIncome,
  editIncomeSource,
};
