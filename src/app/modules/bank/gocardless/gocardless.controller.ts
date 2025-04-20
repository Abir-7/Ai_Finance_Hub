import status from "http-status";
import { BankService } from "./gocardless.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

const startConnection = catchAsync(async (req, res) => {
  //  const { institutionId } = req.body;
  const result = await BankService.createRequisition(
    "SANDBOXFINANCE_SFIN0000",
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success",
    data: result,
  });
});

const getInstitutions = catchAsync(async (req, res) => {
  const result = await BankService.getInstitutions();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success list",
    data: result,
  });
});

const fetchTransactions = catchAsync(async (req, res) => {
  const { accountId } = req.query;
  const result = await BankService.getTransactions(accountId as string);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success to fetch transection",
    data: result,
  });
});

const getAccounts = catchAsync(async (req, res) => {
  const { requisitionId } = req.query;
  const result = await BankService.getAccountsId(requisitionId as string);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Fetched accounts from requisition",
    data: result, // array of account IDs
  });
});

export const BankController = {
  startConnection,
  fetchTransactions,
  getInstitutions,
  getAccounts,
};
