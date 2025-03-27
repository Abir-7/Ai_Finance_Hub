import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { FinanceReportController } from "./financeReport.controller";

const router = Router();
router.get(
  "/get-daily-summary",
  auth("USER"),
  FinanceReportController.getDailySummary
);
router.get(
  "/get-weekly-summary",
  auth("USER"),
  FinanceReportController.getWeeklySummary
);

router.get(
  "/get-present-month-summary",
  auth("USER"),
  FinanceReportController.getPresentMonthSummary
);
router.get(
  "/get-present-month-expance-with-category-percent",
  auth("USER"),
  FinanceReportController.expenseInPercentWithCategory
);

router.get(
  "/get-finanse-data-from-ai",
  auth("USER"),
  FinanceReportController.getDataFromAi
);
export const FinanceReportRoute = router;
