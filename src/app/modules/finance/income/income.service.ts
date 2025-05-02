/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from "mongoose";
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import { IIncome } from "./income.interface";
import Income from "./income.model";
import unlinkFile from "../../../utils/helper/unlinkFiles";
import dayjs from "dayjs";

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

  if (incomeData.source === "salary") {
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    const result = await Income.findOneAndUpdate(
      {
        amount: Number(incomeData.amount),
        source: "salary",
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
      {
        ...incomeData,
        source: incomeData.source.toLowerCase(),
        method: incomeData.method.toLowerCase(),
        user: userId,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    return result;
  }

  const result = await Income.create({
    ...incomeData,
    source: incomeData.source.toLowerCase(),
    method: incomeData.method.toLowerCase(),
    user: userId,
  });

  if (!result) {
    images.map((path) => unlinkFile(path));
  }

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
