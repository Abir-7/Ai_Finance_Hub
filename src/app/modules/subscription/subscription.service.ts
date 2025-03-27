import mongoose from "mongoose";

import { ISubscription } from "./subscription.interface";
import Subscription from "./subscription.model";
import User from "../users/user/user.model";
import AppError from "../../errors/AppError";

const createSubscription = async (
  subscriptionData: ISubscription,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(404, "User not found.");
    }

    const subscriptions = await Subscription.create(
      [{ ...subscriptionData, userId }],
      { session }
    );

    await User.findByIdAndUpdate(
      userId,
      { hasPremiumAccess: true },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return subscriptions[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const SubscriptionService = {
  createSubscription,
};
