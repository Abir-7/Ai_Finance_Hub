/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from "mongoose";

import { TMethod } from "../income/income.interface";
import Income from "../income/income.model";
import Expense from "../expense/expense.model";
import { processQuery } from "../../../openAi/chatAgent";
import {
  ITransaction,
  processTransactions,
} from "../../../openAi/aiDbWriteAgent";
import { Savings } from "../savings/savings.model";

const getDailySummary = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { page = 1, limit = 20 } = query;

  const baseMatch: { user: mongoose.Types.ObjectId; method?: TMethod } = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (query.method === "card" || query.method === "cash") {
    baseMatch.method = query.method;
  }

  const pipeline = [
    // --- Income Pipeline ---
    { $match: baseMatch },
    {
      $project: {
        type: { $literal: "income" },
        amount: 1,
        note: 1,
        description: 1,
        createdAt: 1,
      },
    },
    {
      $addFields: {
        // Grouping key as a date string (YYYY-MM-DD)
        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    // --- Merge with Expense Pipeline ---
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
              description: 1,
              createdAt: 1,
            },
          },
          {
            $addFields: {
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
        ],
      },
    },
    // --- Group by Day ---
    {
      $group: {
        _id: "$day",
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        details: {
          $push: {
            type: "$type",
            amount: "$amount",
            note: "$note",
            description: "$description",
            createdAt: "$createdAt",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    // --- Sort the details array by createdAt ---
    {
      $addFields: {
        details: {
          $sortArray: { input: "$details", sortBy: { createdAt: 1 } },
        },
      },
    },
    {
      $project: {
        day: "$_id",
        totalIncome: 1,
        totalExpense: 1,
        details: 1,
        _id: 0,
      },
    },
    // --- Facet for Pagination ---
    {
      $facet: {
        meta: [{ $count: "totalItem" }],
        data: [
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
        ],
      },
    },
    // --- Format the meta data ---
    {
      $project: {
        data: 1,
        meta: {
          $let: {
            vars: {
              totalItem: { $arrayElemAt: ["$meta.totalItem", 0] },
            },
            in: {
              totalItem: "$$totalItem",
              totalPage: {
                $ceil: { $divide: ["$$totalItem", Number(limit)] },
              },
              limit: Number(limit),
              page: Number(page),
            },
          },
        },
      },
    },
  ];

  const result = await mongoose.connection
    .collection("incomes")
    .aggregate(pipeline)
    .toArray();

  // result[0] contains the meta and data fields separately.
  const { meta, data } = result[0] || {
    meta: {
      totalItem: 0,
      totalPage: 0,
      limit: Number(limit),
      page: Number(page),
    },
    data: [],
  };
  return { meta, data };
};

const getWeeklySummary = async (
  userId: string,
  query: Record<string, unknown>
) => {
  // Set default pagination values if not provided
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const baseMatch: { user: mongoose.Types.ObjectId; method?: string } = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (query.method === "card" || query.method === "cash") {
    baseMatch.method = query.method;
  }

  const result = await mongoose.connection
    .collection("incomes")
    .aggregate([
      // --- Income Pipeline ---
      { $match: baseMatch },
      {
        $project: {
          type: { $literal: "income" },
          amount: 1,
          note: 1,
          description: 1,
          createdAt: 1,
        },
      },
      {
        $addFields: {
          isoWeekYear: { $isoWeekYear: "$createdAt" },
          isoWeek: { $isoWeek: "$createdAt" },
        },
      },
      // --- Merge with Expense Pipeline ---
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
                description: 1,
                createdAt: 1,
              },
            },
            {
              $addFields: {
                isoWeekYear: { $isoWeekYear: "$createdAt" },
                isoWeek: { $isoWeek: "$createdAt" },
              },
            },
          ],
        },
      },
      // --- Group by ISO Week ---
      {
        $group: {
          _id: { isoWeekYear: "$isoWeekYear", isoWeek: "$isoWeek" },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          details: {
            $push: {
              type: "$type",
              amount: "$amount",
              note: "$note",
              description: "$description",
              createdAt: "$createdAt",
            },
          },
        },
      },
      { $sort: { "_id.isoWeekYear": 1, "_id.isoWeek": 1 } },
      // --- Optionally, sort the details array by createdAt ---
      {
        $addFields: {
          details: {
            $sortArray: { input: "$details", sortBy: { createdAt: 1 } },
          },
        },
      },
      // --- Create a week label ---
      {
        $addFields: {
          week: {
            $concat: [
              { $toString: "$_id.isoWeekYear" },
              "-W",
              { $toString: "$_id.isoWeek" },
            ],
          },
        },
      },
      {
        $project: {
          week: 1,
          totalIncome: 1,
          totalExpense: 1,
          details: 1,
          _id: 0,
        },
      },
      // --- Facet for pagination ---
      {
        $facet: {
          meta: [{ $count: "totalItem" }, { $addFields: { page, limit } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ])
    .toArray();

  const meta = { totalItem: 0, totalPage: 0, limit, page };

  const metaData = result[0].meta[0];
  if (metaData) {
    meta.totalItem = metaData.totalItem;
    meta.totalPage = Math.ceil(meta.totalItem / limit);
  }

  const weeklySummary = result[0].data;

  return { data: weeklySummary, meta };
};

const presentMonthSummary = async (userId: string) => {
  // Define the start and end of the present month.
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const endOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );

  // Calculate the UTC start and end of today.
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const todayEnd = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  // Use Promise.all to run both aggregations concurrently.
  const [incomeResult, expenseResult, todayExpenseResult] = await Promise.all([
    Income.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, totalExpenseToday: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
  const totalExpense =
    expenseResult.length > 0 ? expenseResult[0].totalExpense : 0;
  const availableMoney = totalIncome - totalExpense;
  const todayExpense =
    todayExpenseResult.length > 0 ? todayExpenseResult[0].totalExpenseToday : 0;

  const expensePercentage =
    totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const availablePercentage =
    totalIncome > 0 ? (availableMoney / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    availableMoney,
    todayExpense,
    expensePercentage: Math.round(expensePercentage),
    availablePercentage: Math.round(availablePercentage),
  };
};

const expenseInPercentWithCategory = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const data = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: "$category", // Group by category
        totalExpense: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "userbalanceplans",
        pipeline: [
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          { $project: { expenseLimit: 1 } },
        ],
        as: "userPlan",
      },
    },
    { $unwind: "$userPlan" },
    {
      $addFields: {
        limit: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$_id", "food_dining"] },
                then: {
                  $getField: {
                    field: "food_dining",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "transportation"] },
                then: {
                  $getField: {
                    field: "transportation",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "utilities"] },
                then: {
                  $getField: {
                    field: "utilities",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "health_medical"] },
                then: {
                  $getField: {
                    field: "health_medical",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "entertainment"] },
                then: {
                  $getField: {
                    field: "entertainment",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "shopping"] },
                then: {
                  $getField: {
                    field: "shopping",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "education"] },
                then: {
                  $getField: {
                    field: "education",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "travel"] },
                then: {
                  $getField: {
                    field: "travel",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "rent_mortgage"] },
                then: {
                  $getField: {
                    field: "rent_mortgage",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "personal_care"] },
                then: {
                  $getField: {
                    field: "personal_care",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "insurance"] },
                then: {
                  $getField: {
                    field: "insurance",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
              {
                case: { $eq: ["$_id", "other"] },
                then: {
                  $getField: {
                    field: "other",
                    input: "$userPlan.expenseLimit",
                  },
                },
              },
            ],
            default: 0,
          },
        },
      },
    },
    {
      $project: {
        category: "$_id",
        totalExpense: 1,
        percent: {
          $cond: {
            if: { $gt: ["$limit", 0] },
            then: {
              $round: [
                { $multiply: [{ $divide: ["$totalExpense", "$limit"] }, 100] },
                0,
              ],
            },
            else: 0,
          },
        },
      },
    },
  ]);

  return data;
};

let userRes: { data?: string; user?: string } = {};
const getDataFromAi = async (
  userId: string,
  text: string,
  imageUrl: string
) => {
  const prompt = `
  User Text: ${text}
  User ID: ${userId}
  `;

  let data = "";
  if (
    userRes.data &&
    userRes.user === userId &&
    prompt.toLowerCase().includes("save") &&
    prompt.toLowerCase().includes("don't") === false
  ) {
    data = await processQuery(
      `${userRes.data}.save it. userId:${userRes.user}`,
      ""
    );
    userRes = {};
  } else {
    data = await processQuery(prompt, imageUrl);
    userRes = { data, user: userId };
  }
  return data;
};

const saveDataByAi = async (transactions: ITransaction[], userId: string) => {
  const newTransactions: ITransaction[] = [];

  for (const tx of transactions) {
    const [existingExpense, existingIncome, existingSavings] =
      await Promise.all([
        Expense.findOne({ tId: tx.id }),
        Income.findOne({ tId: tx.id }),
        Savings.findOne({ tId: tx.id }),
      ]);

    if (!existingExpense && !existingIncome && !existingSavings) {
      newTransactions.push(tx); // Only add if not already present
    }
  }

  return await processTransactions({ transactions: newTransactions }, userId);
};

export const FinanceReportService = {
  getDailySummary,
  getWeeklySummary,
  presentMonthSummary,
  expenseInPercentWithCategory,
  getDataFromAi,
  saveDataByAi,
};
