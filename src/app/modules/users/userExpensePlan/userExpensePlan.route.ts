import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { UserExpensePlanController } from "./userExpensePlan.controller";
import zodValidator from "../../../middleware/zodValidator";
import {
  zodCreateUserExpensePlanSchema,
  zodUpdateUserExpensePlanSchema,
} from "./userExpensePlan.validation";

const router = Router();

router.post(
  "/add-expense-plan",
  auth("USER"),
  zodValidator(zodCreateUserExpensePlanSchema),
  UserExpensePlanController.addUserExpencePlan
);

router.patch(
  "/update-expense-plan",
  auth("USER"),
  zodValidator(zodUpdateUserExpensePlanSchema),
  UserExpensePlanController.updateUserExpensePlan
);
router.get(
  "/get-expense-limit",
  auth("USER"),
  UserExpensePlanController.getUserExpenseLimit
);
export const UserExpensePlanRoute = router;
