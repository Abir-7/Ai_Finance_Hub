/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from "mongoose";
import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import { IIncome, TSource } from "./income.interface";
import Income from "./income.model";
import unlinkFile from "../../../utils/helper/unlinkFiles";
import dayjs from "dayjs";
import { PresentMonthData } from "../financeReport/financeReport.model";
import AppError from "../../../errors/AppError";

import { Savings } from "../savings/savings.model";

const addIncome = async (
  imageArray: Express.Multer.File[],
  incomeData: IIncome,
  userId: string
): Promise<IIncome> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const images: string[] = [];
    for (const image of imageArray) {
      const path = getRelativePath(image.path);
      images.push(path);
    }

    if (images.length) {
      incomeData.description.images = images;
    }

    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    let result: IIncome;

    if (incomeData.source === "salary") {
      result = await Income.findOneAndUpdate(
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
          session,
        }
      );
    } else {
      result = await Income.create(
        [
          {
            ...incomeData,
            source: incomeData.source.toLowerCase(),
            method: incomeData.method.toLowerCase(),
            user: userId,
          },
        ],
        { session }
      ).then((res) => res[0]);

      // If creation failed for some reason
      if (!result) {
        for (const path of images) {
          unlinkFile(path);
        }
        throw new Error("Income creation failed");
      }
    }

    await PresentMonthData.findOneAndUpdate(
      {
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
      {
        $inc: {
          totalIncome: incomeData.amount,
          availableMoney: incomeData.amount,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Cleanup uploaded files
    for (const image of imageArray) {
      unlinkFile(getRelativePath(image.path));
    }

    throw error;
  }
};

const addIncomeByAi = async (
  imageArray: Express.Multer.File[],
  incomeData: IIncome,
  userId: string,
  tId: string,
  accId: string
): Promise<IIncome> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const images: string[] = [];
    for (const image of imageArray) {
      const path = getRelativePath(image.path);
      images.push(path);
    }

    if (images.length) {
      incomeData.description.images = images;
    }

    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();

    let result: IIncome;

    if (incomeData.source === "salary") {
      result = await Income.findOneAndUpdate(
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
          tId,
          accId,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session,
        }
      );
    } else {
      result = await Income.create(
        [
          {
            ...incomeData,
            source: incomeData.source.toLowerCase(),
            method: incomeData.method.toLowerCase(),
            user: userId,
            tId,
            accId,
          },
        ],
        { session }
      ).then((res) => res[0]);

      // If creation failed for some reason
      if (!result) {
        for (const path of images) {
          unlinkFile(path);
        }
        throw new Error("Income creation failed");
      }
    }

    await PresentMonthData.findOneAndUpdate(
      {
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
      {
        $inc: {
          totalIncome: incomeData.amount,
          availableMoney: incomeData.amount,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Cleanup uploaded files
    for (const image of imageArray) {
      unlinkFile(getRelativePath(image.path));
    }

    throw error;
  }
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

const editIncomeSource = async (incomeId: string, source: TSource) => {
  if (source === "transfer") {
    const incomeData = await Income.findById(incomeId);

    const createSavings = await Savings.create({
      accId: incomeData?.accId,
      amount: incomeData?.amount,
      tId: incomeData?.tId,
    });
    await Income.findByIdAndDelete(incomeId);
    return createSavings;
  }

  const incomeData = await Income.findByIdAndUpdate(
    incomeId,
    { source: source.toLowerCase() },
    { new: true, runValidators: true }
  );

  if (!incomeData) {
    throw new AppError(404, "Income data not found");
  }
  return incomeData;
};

export const IncomeService = {
  addIncome,
  getIncomeDataByDate,
  getCurrentMonthIncome,
  addIncomeByAi,
  editIncomeSource,
};
