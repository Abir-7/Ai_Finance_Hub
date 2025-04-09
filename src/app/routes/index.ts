import { CourseRouter } from "./../modules/course/course.route";
import { Router } from "express";
import { UserRoute } from "../modules/users/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserProfileRoute } from "../modules/users/userProfile/userProfile.route";

import { UserExpensePlanRoute } from "../modules/users/userExpensePlan/userExpensePlan.route";
import { IncomeRoute } from "../modules/finance/income/income.route";
import { ExpenseRoute } from "../modules/finance/expense/expense.route";
import { FinanceReportRoute } from "../modules/finance/financeReport/financeReport.route";
import { SubscriptionRoute } from "../modules/subscription/subscription.route";
import { NotificationRouter } from "../modules/notification/notification.route";
import { BankRoute } from "../modules/bank/gocardless.router";

const router = Router();

const apiRoutes = [
  { path: "/user", route: UserRoute },
  { path: "/user-profile", route: UserProfileRoute },
  { path: "/user-expense-plan", route: UserExpensePlanRoute },
  { path: "/auth", route: AuthRoute },
  { path: "/income", route: IncomeRoute },
  { path: "/expense", route: ExpenseRoute },
  { path: "/finance-report", route: FinanceReportRoute },
  { path: "/subscription", route: SubscriptionRoute },
  { path: "/course", route: CourseRouter },
  { path: "/notifications", route: NotificationRouter },
  { path: "/bank", route: BankRoute },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
