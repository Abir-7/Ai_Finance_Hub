import { Router } from "express";
import { UserRoute } from "../modules/users/user/user.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserProfileRoute } from "../modules/users/userProfile/userProfile.route";

import { UserExpensePlanRoute } from "../modules/users/userExpensePlan/userExpensePlan.route";

const router = Router();
const apiRoutes = [
  { path: "/user", route: UserRoute },
  { path: "/user-profile", route: UserProfileRoute },
  { path: "/user-balance", route: UserExpensePlanRoute },
  { path: "/auth", route: AuthRoute },
];
apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
