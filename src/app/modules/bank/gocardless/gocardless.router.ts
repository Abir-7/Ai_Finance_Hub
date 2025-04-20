import { Router } from "express";
import { BankController } from "./gocardless.controller";
import { auth } from "../../../middleware/auth/auth";

const router = Router();

router.post("/connect", auth("USER"), BankController.startConnection);
router.get("/transactions", BankController.fetchTransactions);
router.get("/bank-list", BankController.getInstitutions);
router.get("/get-accounts-id", BankController.getAccounts);
export const BankRoute = router;
