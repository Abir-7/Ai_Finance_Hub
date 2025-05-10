import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { TintService } from "./tink.service";

const getBankTransectionUrl = catchAsync(async (req, res) => {
  //  const { institutionId } = req.body;
  const result = await TintService.getBankTransectionUrl(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success bank list url",
    data: result,
  });
});

// const getBankAccountIdlist = catchAsync(async (req, res) => {
//   const result = await TintService.getBankAccountIdlist(
//     req.body.token,
//     req.user.userId
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Success bank Id list",
//     data: result,
//   });
// });

const handleCallback = catchAsync(async (req, res) => {
  const { code, state } = req.query;

  const result = await TintService.handleCallbackForTransection(
    code as string,
    state as string
  );

  res.setHeader("Content-Type", "text/html");
  res.send(result);
});
const getAllTransection = catchAsync(async (req, res) => {
  const userId = req.body.userId;

  const result = await TintService.getAllTransection(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success",
    data: result,
  });
});

const fetchBankData = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await TintService.fetchBankData(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Success",
    data: result,
  });
});

// const fetchBankData = catchAsync(async (req, res) => {
//   const nextPageToken = req.query.nextPageToken as string | undefined;

//   const result = await TintService.fetchBankData(
//     req.user.userId,
//     req.body.token,
//     nextPageToken,
//     req.body.accountId
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "Success",
//     data: result,
//   });
// });

export const TintController = {
  getBankTransectionUrl,
  handleCallback,
  fetchBankData,
  // getBankAccountIdlist,
  getAllTransection,
};
