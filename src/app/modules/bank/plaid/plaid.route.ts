import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { PlaidController } from "./plaid.controller";

const router = Router();

router.get("/get-link-token", auth("USER"), PlaidController.getLinkToken);
router.post(
  "/exchange-public-token",
  auth("USER"),
  PlaidController.exchangePublicToken
);
export const PlaidRoute = router;
