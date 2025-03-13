import { Router } from "express";

const router = Router();
const apiRoutes = [{ path: "/user" }];
apiRoutes.forEach((route) => router.use(route.path));
export default router;
