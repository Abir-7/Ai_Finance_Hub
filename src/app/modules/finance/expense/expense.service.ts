/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import Expense from "./expense.model";
import { IExpense } from "./expense.interface";
import mongoose, { Mongoose } from "mongoose";
import UserExpensePlan from "../../users/userExpensePlan/userExpensePlan.model";
import AppError from "../../../errors/AppError";
import unlinkFile from "../../../utils/helper/unlinkFiles";
import { PresentMonthData } from "../financeReport/financeReport.model";
import dayjs from "dayjs";
import { TCategory } from "../../users/userExpensePlan/userExpensePlan.interface";
import { NotificationService } from "../../notification/notification.service";
import { Notification } from "../../notification/notification.model";

// const addExpense = async (
//   imageArray: Express.Multer.File[],
//   expenseData: IExpense,
//   userId: string
// ): Promise<IExpense> => {
//   console.log(userId);
//   const expenseLimitData = await UserExpensePlan.findOne({
//     user: userId,
//   }).lean();

//   const images = [];
//   for (let i = 0; i < imageArray.length; i++) {
//     const path = getRelativePath(imageArray[i].path);
//     images.push(path);
//   }

//   if (images.length !== 0) {
//     expenseData.description.images = images;
//   }

//   console.log(expenseLimitData);

//   if (
//     !expenseLimitData ||
//     expenseLimitData?.balance?.expense <= 0 ||
//     expenseLimitData?.balance?.income <= 0
//   ) {
//     images.map((path) => unlinkFile(path));
//     throw new AppError(500, "Update your Expense plan first.");
//   }

//   const result = await Expense.create({
//     ...expenseData,
//     method: expenseData.method.toLowerCase(),
//     category: expenseData.category.toLowerCase(),
//     user: userId,
//   });

//   return result;
// };

export const addExpense = async (
  imageArray: Express.Multer.File[],
  expenseData: IExpense,
  userId: string
): Promise<IExpense> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const images = [];

  try {
    // 💥 Expense Limit Check
    const expenseLimitData = await UserExpensePlan.findOne({
      user: userId,
    }).lean();

    if (
      !expenseLimitData ||
      expenseLimitData?.balance?.expense <= 0 ||
      expenseLimitData?.balance?.income <= 0
    ) {
      throw new AppError(500, "Update your Expense plan first.");
    }

    // 📸 Image Upload Handling
    for (const img of imageArray) {
      const path = getRelativePath(img.path);
      images.push(path);
    }

    if (images.length > 0) {
      expenseData.description.images = images;
    }

    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    // 📆 Find or Create Monthly Summary
    const present = await PresentMonthData.findOne({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).session(session);

    if (present) {
      const newAvailable = present.availableMoney - expenseData.amount;

      if (newAvailable < 0) {
        throw new AppError(
          400,
          `Not enough available balance for this expense. gap:${newAvailable}`
        );
      }

      present.totalExpense += expenseData.amount;
      present.availableMoney = newAvailable;
      await present.save({ session });
    } else {
      // Prevent adding expense if no PresentMonthData and no income yet
      throw new AppError(400, "No monthly summary found. Add income first.");
    }

    // 💾 Save Expense
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

    const categorylimit =
      expenseLimitData?.expenseLimit[
        expenseData.category.toLowerCase() as TCategory
      ];

    const totalSpent = categoryTotalCost[0]?.total || 0;
    const categoryLimit = categorylimit || 0;

    const percentageUsed =
      categoryLimit > 0 ? (totalSpent / categoryLimit) * 100 : 0;

    const value = Number(percentageUsed.toFixed(2));

    if (value > 75 && value < 100) {
      await Notification.create({
        category: expenseData.category.toLowerCase() as TCategory,
        description: ` You're nearing your budget limit for "${expenseData.category}`,
        title: "Expense Limit",
        user: new mongoose.Types.ObjectId(userId),
      });
    }

    if (value >= 100) {
      await Notification.create({
        category: expenseData.category.toLowerCase() as TCategory,
        description: ` You've exceeded your budget for "${expenseData.category}`,
        title: "Expense Limit",
        user: new mongoose.Types.ObjectId(userId),
      });
    }

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    // Clean up uploaded images on failure
    for (const path of images) {
      unlinkFile(path);
    }

    throw new Error("Something went wrong when save expense data! Try again.");
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
};
