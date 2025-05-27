import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { FinanceReportController } from "./financeReport.controller";
import { upload } from "../../../middleware/fileUpload/fileUploadHandler";
import { parseDataField } from "../../../middleware/fileUpload/parseDataField";

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

router.post(
  "/get-finanse-data-from-ai",
  auth("USER"),
  upload.single("image"),
  parseDataField("data"),
  FinanceReportController.getDataFromAi
);

router.get(
  "/save-finanse-data-by-ai",
  auth("USER"),
  FinanceReportController.saveDataByAi
);
export const FinanceReportRoute = router;
