import { Router } from "express";
import { auth } from "../../../middleware/auth/auth";
import { TintController } from "./tink.controller";

const router = Router();

router.get(
  "/get-bank-list-transection",
  auth("USER"),
  TintController.getBankTransectionUrl
);
router.get("/callback", TintController.handleCallback);
router.post("/transactions", TintController.saveAllTransection);
router.get(
  "/get-transactions-from-db",
  auth("USER"),
  TintController.fetchBankData
);
router.post(
  "/categorise-transection",
  auth("USER"),
  TintController.categoriseAllTransection
);
// router.post(
//   "/get-bank-id-list",
//   auth("USER"),
//   TintController.getBankAccountIdlist
// );

//router.get("/get-bank-data", auth("USER"), TintController.fetchBankData);

// router.get("/get-token", auth("USER"), TintController.getAccessToken);

export const TintRoute = router;
