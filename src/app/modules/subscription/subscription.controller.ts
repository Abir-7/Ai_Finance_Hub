import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscriptionService } from "./subscription.service";
import httpStatus from "http-status";

const createSubscription = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const subscriptionData = req.body;

  const result = await SubscriptionService.createSubscription(
    subscriptionData,
    userId
  );

  sendResponse(res, {
    data: result,
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Subscription created successfully.",
  });
});

export const SubscriptionController = {
  createSubscription,
};
