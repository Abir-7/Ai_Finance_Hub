import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { IncomeService } from "./income.service";

const addIncome = catchAsync(async (req, res) => {
  //   const filePath = req.file?.path;

  const result = await IncomeService.addIncome(
    req.files as Express.Multer.File[],
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User income data successfully stored.",
    data: result,
  });
});

export const IncomeController = {
  addIncome,
};
