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

router.get(
  "/get-expense-data-by-date",
  auth("USER"),

  ExpenseController.getExpenseDataByDate
);

export const ExpenseRoute = router;
