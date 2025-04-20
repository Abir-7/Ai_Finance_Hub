import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { PlaidService } from "./plaid.service";

const getLinkToken = catchAsync(async (req, res) => {
  //  const { institutionId } = req.body;
  const result = await PlaidService.getLinkToken(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success",
    data: result,
  });
});

const exchangePublicToken = catchAsync(async (req, res) => {
  const result = await PlaidService.exchangePublicToken(req.body.publicToken);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success",
    data: result,
  });
});

export const PlaidController = { getLinkToken, exchangePublicToken };
