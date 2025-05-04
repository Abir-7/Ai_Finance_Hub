/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import Expense from "./expense.model";
import { IExpense, TCategory } from "./expense.interface";
import mongoose, { Mongoose } from "mongoose";
import UserExpensePlan from "../../users/userExpensePlan/userExpensePlan.model";
import AppError from "../../../errors/AppError";
import unlinkFile from "../../../utils/helper/unlinkFiles";
import { PresentMonthData } from "../financeReport/financeReport.model";
import dayjs from "dayjs";

import { Notification } from "../../notification/notification.model";

export const addExpense = async (
  imageArray: Express.Multer.File[],
  expenseData: IExpense,
  userId: string
): Promise<IExpense> => {
  console.log(expenseData);
  const session = await mongoose.startSession();
  session.startTransaction();

  const images: string[] = [];
  expenseData.amount = Math.abs(expenseData.amount);

  try {
    // ✅ Check Expense Plan Validity
    const expenseLimitData = await UserExpensePlan.findOne({
      user: userId,
    }).lean();

    if (
      !expenseLimitData ||
      expenseLimitData?.balance?.avgExpense <= 0 ||
      expenseLimitData?.balance?.avgIncome <= 0
    ) {
      throw new AppError(500, "Update your Expense plan first.");
    }

    // ✅ Handle Image Uploads
    for (const img of imageArray) {
      const path = getRelativePath(img.path);
      images.push(path);
    }
    if (images.length > 0) {
      expenseData.description.images = images;
    }

    // ✅ Date Setup for this Month
    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    // ✅ Monthly Summary Update
    let present = await PresentMonthData.findOne({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).session(session);

    if (present) {
      present.totalExpense += expenseData.amount;
      present.availableMoney -= expenseData.amount;
      await present.save({ session });
    } else {
      present = await PresentMonthData.create(
        [
          {
            availableMoney: 0,
            totalExpense: expenseData.amount,
            totalIncome: 0,
            user: userId,
          },
        ],
        { session }
      ).then((res) => res[0]);
    }

    // ✅ Save Expense
    const result = await Expense.create(
      [
        {
          ...expenseData,
          method: expenseData.method.toLowerCase(),
          category: expenseData.category.toLowerCase(),
          user: userId,
        },
      ],
      { session }
    );

    // ✅ Calculate Category Usage
    const categoryTotalCost = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          category: expenseData.category.toLowerCase(),
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categoryLimit =
      expenseLimitData.expenseLimit[
        expenseData.category.toLowerCase() as keyof typeof expenseLimitData.expenseLimit
      ] || 0;

    const totalSpent = categoryTotalCost[0]?.total || 0;
    const percentageUsed =
      categoryLimit > 0 ? (totalSpent / categoryLimit) * 100 : 0;
    const value = Number(percentageUsed.toFixed(2));

    if (value > 75 && value < 100) {
      await Notification.create(
        [
          {
            category: expenseData.category.toLowerCase() as TCategory,
            description: `You're nearing your budget limit for "${expenseData.category}".`,
            title: "Expense Limit",
            user: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session }
      );
    }

    if (value >= 100) {
      await Notification.create(
        [
          {
            category: expenseData.category.toLowerCase() as TCategory,
            description: `You've exceeded your budget for "${expenseData.category}".`,
            title: "Expense Limit",
            user: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    for (const path of images) {
      unlinkFile(path); // 🧹 Clean up images on failure
    }

    throw new Error(
      "Something went wrong when saving expense data! Try again."
    );
  }
};

export const addExpenseByAi = async (
  imageArray: Express.Multer.File[],
  expenseData: IExpense,
  userId: string,
  tId: string,
  accId: string
): Promise<IExpense> => {
  console.log(expenseData);
  const session = await mongoose.startSession();
  session.startTransaction();

  const images: string[] = [];
  expenseData.amount = Math.abs(expenseData.amount);

  try {
    // ✅ Check Expense Plan Validity
    const expenseLimitData = await UserExpensePlan.findOne({
      user: userId,
    }).lean();

    if (
      !expenseLimitData ||
      expenseLimitData?.balance?.avgExpense <= 0 ||
      expenseLimitData?.balance?.avgIncome <= 0
    ) {
      throw new AppError(500, "Update your Expense plan first.");
    }

    // ✅ Handle Image Uploads
    for (const img of imageArray) {
      const path = getRelativePath(img.path);
      images.push(path);
    }
    if (images.length > 0) {
      expenseData.description.images = images;
    }

    // ✅ Date Setup for this Month
    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    // ✅ Monthly Summary Update
    let present = await PresentMonthData.findOne({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).session(session);

    if (present) {
      present.totalExpense += expenseData.amount;
      present.availableMoney -= expenseData.amount;
      await present.save({ session });
    } else {
      present = await PresentMonthData.create(
        [
          {
            availableMoney: 0,
            totalExpense: expenseData.amount,
            totalIncome: 0,
            user: userId,
          },
        ],
        { session }
      ).then((res) => res[0]);
    }

    // ✅ Save Expense
    const result = await Expense.create(
      [
        {
          ...expenseData,
          method: expenseData.method.toLowerCase(),
          category: expenseData.category.toLowerCase(),
          user: userId,
          accId,
          tId,
        },
      ],
      { session }
    );

    // ✅ Calculate Category Usage
    const categoryTotalCost = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          category: expenseData.category.toLowerCase(),
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categoryLimit =
      expenseLimitData.expenseLimit[
        expenseData.category.toLowerCase() as keyof typeof expenseLimitData.expenseLimit
      ] || 0;

    const totalSpent = categoryTotalCost[0]?.total || 0;
    const percentageUsed =
      categoryLimit > 0 ? (totalSpent / categoryLimit) * 100 : 0;
    const value = Number(percentageUsed.toFixed(2));

    if (value > 75 && value < 100) {
      await Notification.create(
        [
          {
            category: expenseData.category.toLowerCase() as TCategory,
            description: `You're nearing your budget limit for "${expenseData.category}".`,
            title: "Expense Limit",
            user: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session }
      );
    }

    if (value >= 100) {
      await Notification.create(
        [
          {
            category: expenseData.category.toLowerCase() as TCategory,
            description: `You've exceeded your budget for "${expenseData.category}".`,
            title: "Expense Limit",
            user: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    for (const path of images) {
      unlinkFile(path); // 🧹 Clean up images on failure
    }

    throw new Error(
      "Something went wrong when saving expense data! Try again."
    );
  }
};

const getExpenseDataByDate = async (userId: string) => {
  const expensesGrouped = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalExpense: { $sum: "$amount" },
        expenseDetails: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalExpense: 1,
        expenseDetails: 1,
      },
    },
    {
      $sort: { date: -1 },
    },
  ]);
  return expensesGrouped;
};

const getCurrentMonthExpense = async (userId: string) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const expenseData = await Expense.find({
    user: userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return expenseData;
};

export const ExpenseService = {
  addExpense,
  getExpenseDataByDate,
  getCurrentMonthExpense,
  addExpenseByAi,
};
