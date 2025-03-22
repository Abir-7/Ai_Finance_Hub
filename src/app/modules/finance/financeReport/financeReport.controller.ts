import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { FinanceReportService } from "./financeReport.service";

const getDailySummary = catchAsync(async (req, res) => {
  const result = await FinanceReportService.getDailySummary(
    req.user.userId,
    req.query as { method: "cash" | "card" }
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User daily summary data successfully fetched.",
    data: result,
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
    data: result,
  });
});

export const FinanceReportController = {
  getDailySummary,
  getWeeklySummary,
};
