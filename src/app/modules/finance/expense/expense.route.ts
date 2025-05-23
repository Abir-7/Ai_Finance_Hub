import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { upload } from "../../../middleware/fileUpload/fileUploadHandler";
import { parseDataField } from "../../../middleware/fileUpload/parseDataField";
import { ExpenseController } from "./exprense.controller";
import zodValidator from "../../../middleware/zodValidator";
import { zodExpenseSchema } from "./expense.validation";

const router = Router();

router.post(
  "/add-expense",
  auth("USER"),
  upload.array("images", 3),
  parseDataField("data"),
  zodValidator(zodExpenseSchema),
  ExpenseController.addExpense
);

router.post(
  "/add-expense-by-voice",
  auth("USER"),
  ExpenseController.addExpenseByVoice
);

router.get(
  "/get-expense-data-by-date",
  auth("USER"),
  ExpenseController.getExpenseDataByDate
);

router.patch(
  "/edit-category/:id",
  auth("USER"),
  ExpenseController.editExpenseCategory
);

router.get(
  "/get-current-month-expense",
  auth("USER"),
  ExpenseController.getCurrentMonthExpense
);

export const ExpenseRoute = router;
