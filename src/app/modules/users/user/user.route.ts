import { Router } from "express";
import { UserController } from "./user.controller";

import { zodCreateUserSchema } from "./user.validation";
import zodValidator from "../../../middleware/zodValidator";

const router = Router();

router.post(
  "/create-user",
  zodValidator(zodCreateUserSchema),
  UserController.createUser
);

export const UserRoute = router;
