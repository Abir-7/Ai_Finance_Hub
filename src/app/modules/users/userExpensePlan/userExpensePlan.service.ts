/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import status from "http-status";
import AppError from "../../../errors/AppError";
import User from "../user/user.model";

import { Types } from "mongoose";
import { removeFalsyFields } from "../../../utils/helper/removeFalsyField";
import { sumNumericValues } from "../../../utils/helper/sumNumericValues";

import UserExpensePlan from "./userExpensePlan.model";
import { IUserExpensePlan } from "./userExpensePlan.interface";

const addUserExpensePlan = async (
  data: IUserExpensePlan,
  userEmail: string
) => {
  const { balance, expenseLimit } = data;

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const filteredData = removeFalsyFields(expenseLimit, false);

  const total = sumNumericValues(filteredData);

  balance.expense = total;

  const plan = await UserExpensePlan.create({
    balance,
    expenseLimit: filteredData,
    user: user._id,
  });
  return plan;
};

const updateUserExpensePlan = async (
  updatedData: Partial<IUserExpensePlan>,
  userId: string
): Promise<IUserExpensePlan & { _id: Types.ObjectId }> => {
  const { balance, expenseLimit = {} } = updatedData;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const expensePlan = await UserExpensePlan.findOne({ user: userId });
  if (!expensePlan) {
    throw new AppError(status.NOT_FOUND, "Expense plan  not found");
  }

  if (balance?.income) {
    expensePlan.balance.income = balance?.income;
  }

  const filteredData = removeFalsyFields(expenseLimit, false) as Record<
    string,
    number
  >;

  if (Object.keys(filteredData).length !== 0) {
    Object.keys(filteredData).forEach((key: string) => {
      (expensePlan.expenseLimit as Record<string, number>)[key] =
        filteredData[key];
    });

    const totalExpense = Object.values(expensePlan.expenseLimit).reduce(
      (sum, value) => sum + value,
      0
    );
    expensePlan.balance.expense = totalExpense;
  }

  await expensePlan.save();

  return expensePlan;
};

const getUserExpenseLimit = async (userId: string) => {
  const result = await UserExpensePlan.findOne({ user: userId });
  return result;
};

export const UserExpensePlanService = {
  addUserExpensePlan,
  updateUserExpensePlan,
  getUserExpenseLimit,
};
