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
export const FinanceReportRoute = router;
