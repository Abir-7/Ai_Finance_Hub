import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { upload } from "../../../middleware/fileUpload/fileUploadHandler";
import { parseDataField } from "../../../middleware/fileUpload/parseDataField";
import { IncomeController } from "./income.controller";
import zodValidator from "../../../middleware/zodValidator";
import { zodIncomeSchema } from "./income.validation";

const router = Router();

router.post(
  "/add-income",
  auth("USER"),
  upload.array("images", 3),
  parseDataField("data"),
  zodValidator(zodIncomeSchema),
  IncomeController.addIncome
);
router.get(
  "/get-income-data-by-date",
  auth("USER"),
  IncomeController.getIncomeDataByDate
);
router.get(
  "/get-current-month-income",
  auth("USER"),
  IncomeController.getCurrentMonthIncome
);

export const IncomeRoute = router;
