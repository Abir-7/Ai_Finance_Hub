import { Router } from "express";
import { UserRoute } from "../modules/users/user/user.route";

const router = Router();
const apiRoutes = [{ path: "/user", route: UserRoute }];
apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
