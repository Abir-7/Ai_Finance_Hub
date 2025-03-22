/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from "mongoose";

import { TMethod } from "../income/income.interface";

const getDailySummary = async (
  userId: string,
  query: { method: TMethod }
) => {};

const getWeeklySummary = async (userId: string, query: { method: TMethod }) => {
  const baseMatch: { user: mongoose.Types.ObjectId; method?: TMethod } = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (query.method === "card" || query.method === "cash") {
    baseMatch.method = query.method;
  }
  const weeklySummary = await mongoose.connection
    .collection("incomes")
    .aggregate([
      // --- Income Pipeline ---
      { $match: baseMatch },
      {
        $project: {
          type: { $literal: "income" },
          amount: 1,
          createdAt: 1,
        },
      },
      {
        $addFields: {
          weekYear: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        },
      },
      // --- Merge with Expense Data ---
      {
        $unionWith: {
          coll: "expenses",
          pipeline: [
            { $match: baseMatch },
            {
              $project: {
                type: { $literal: "expense" },
                amount: 1,
                note: 1,
                "description.info": 1,
                "description.images": 1,
                createdAt: 1,
              },
            },
            {
              $addFields: {
                weekYear: { $isoWeekYear: "$createdAt" },
                week: { $isoWeek: "$createdAt" },
              },
            },
          ],
        },
      },
      // --- Grouping by Week ---
      {
        $group: {
          _id: { weekYear: "$weekYear", week: "$week" },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          expenseData: {
            $push: {
              $cond: [
                { $eq: ["$type", "expense"] },
                {
                  amount: "$amount",
                  note: "$note",
                  description: "$description",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      // --- Format Week and Sort ---
      {
        $addFields: {
          week: {
            $concat: [
              { $toString: "$_id.weekYear" },
              "-W",
              { $toString: "$_id.week" },
            ],
          },
        },
      },
      { $sort: { "_id.weekYear": 1, "_id.week": 1 } },
      {
        $project: {
          week: 1,
          totalIncome: 1,
          totalExpense: 1,
          expenseData: 1,
          _id: 0,
        },
      },
    ])
    .toArray();

  return weeklySummary;
};

export const FinanceReportService = {
  getDailySummary,
  getWeeklySummary,
};
