/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from "mongoose";
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import { IIncome } from "./income.interface";
import Income from "./income.model";

const addIncome = async (
  imageArray: Express.Multer.File[],
  incomeData: IIncome,
  userId: string
): Promise<IIncome> => {
  const images = [];
  for (let i = 0; i < imageArray.length; i++) {
    const path = getRelativePath(imageArray[i].path);
    images.push(path);
  }

  if (images.length !== 0) {
    incomeData.description.images = images;
  }

  const result = await Income.create({ ...incomeData, user: userId });

  return result;
};

const getIncomeDataByDate = async (userId: string) => {
  const incomesGrouped = await Income.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalIncome: { $sum: "$amount" },
        incomeDetails: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalIncome: 1,
        incomeDetails: 1,
      },
    },
    {
      $sort: { date: -1 },
    },
  ]);

  return incomesGrouped;
};

const getCurrentMonthIncome = async (userId: string) => {
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

  const incomeData = await Income.find({
    user: userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return incomeData;
};

export const IncomeService = {
  addIncome,
  getIncomeDataByDate,
  getCurrentMonthIncome,
};
