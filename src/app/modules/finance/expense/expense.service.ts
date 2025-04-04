/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import Expense from "./expense.model";
import { IExpense } from "./expense.interface";
import mongoose from "mongoose";

const addExpense = async (
  imageArray: Express.Multer.File[],
  expenseData: IExpense,
  userId: string
): Promise<IExpense> => {
  const images = [];
  for (let i = 0; i < imageArray.length; i++) {
    const path = getRelativePath(imageArray[i].path);
    images.push(path);
  }

  if (images.length !== 0) {
    expenseData.description.images = images;
  }

  const result = await Expense.create({ ...expenseData, user: userId });

  return result;
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
