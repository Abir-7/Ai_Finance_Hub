import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { UserExpensePlanController } from "./userExpensePlan.controller";

const router = Router();

router.post("/add-expense-plan", UserExpensePlanController.addUserExpencePlan);

router.patch(
  "/update-expense-plan",
  auth("USER"),

  UserExpensePlanController.updateUserExpensePlan
);
router.get(
  "/get-expense-limit",
  auth("USER"),
  UserExpensePlanController.getUserExpenseLimit
);
export const UserExpensePlanRoute = router;
