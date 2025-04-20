import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { FinanceReportService } from "./financeReport.service";
import Tesseract from "tesseract.js";
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
const getDailySummary = catchAsync(async (req, res) => {
  const result = await FinanceReportService.getDailySummary(
    req.user.userId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User daily summary data successfully fetched.",
    data: result.data,
    meta: result.meta,
  });
});

const getWeeklySummary = catchAsync(async (req, res) => {
  const result = await FinanceReportService.getWeeklySummary(
    req.user.userId,
    req.query as { method: "cash" | "card" }
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User weekly summary data successfully fetched.",
    data: result.data,
    meta: result.meta,
  });
});

const getPresentMonthSummary = catchAsync(async (req, res) => {
  const result = await FinanceReportService.presentMonthSummary(
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User present month summary data successfully fetched.",
    data: result,
  });
});
const expenseInPercentWithCategory = catchAsync(async (req, res) => {
  const result = await FinanceReportService.expenseInPercentWithCategory(
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User present expense with category percent successfully fetched.",
    data: result,
  });
});

const getDataFromAi = catchAsync(async (req, res) => {
  let text1 = "";

  if (req.file) {
    const path = getRelativePath(req.file?.path as string);

    const imageUrl = `http://192.168.10.18:5000/${path}`;

    await Tesseract.recognize(imageUrl, "eng").then(({ data: { text } }) => {
      text1 = text;
    });
  }

  const result = await FinanceReportService.getDataFromAi(
    req.user.userId,
    req.body.text,
    text1
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Ai Data is Given.",
    data: result,
  });
});
export const FinanceReportController = {
  getDailySummary,
  getWeeklySummary,
  getPresentMonthSummary,
  expenseInPercentWithCategory,
  getDataFromAi,
};
