import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { TintController } from "./tink.controller";

const router = Router();

router.get(
  "/get-bank-list-transection",
  auth("USER"),
  TintController.getBankTransectionUrl
);
router.get("/get-bank-lncome", auth("USER"), TintController.getBankIncomeUrl);
router.post(
  "/get-bank-id-list",
  auth("USER"),
  TintController.getBankAccountIdlist
);

router.get("/callback", TintController.handleCallback);

router.get("/get-bank-data", auth("USER"), TintController.fetchBankData);

// router.get("/get-token", auth("USER"), TintController.getAccessToken);

export const TintRoute = router;
