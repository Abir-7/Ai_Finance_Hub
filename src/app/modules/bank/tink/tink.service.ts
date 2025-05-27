import { UserProfile } from "./../../users/userProfile/userProfile.model";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from "axios";
import { appConfig } from "../../../config";
// import User from "../../users/user/user.model";
// import AppError from "../../../errors/AppError";
// import status from "http-status";
import dayjs from "dayjs";
import logger from "../../../utils/logger";
import { TinkAcceesToken } from "../../../utils/Tink_Bank_api/getAccessToken";
import { BankTransaction } from "./tink.model";
import User from "../../users/user/user.model";

import { jwtDecode } from "jwt-decode";
import Expense from "../../finance/expense/expense.model";
import Income from "../../finance/income/income.model";
import { Savings } from "../../finance/savings/savings.model";
import { IBankTransaction } from "./tink.interface";
import { processTransactionsByGemini } from "../../../aiTask/gemini/geminiAiDbWrite";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const getBankTransectionUrl = async (id: string) => {
  const userProfile = await UserProfile.findOne({ user: id });

  if (userProfile && userProfile.country) {
    const tinkLink = `https://link.tink.com/1.0/transactions/connect-accounts/?client_id=${appConfig.tink.id}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fbank%2Fcallback&market=${userProfile.country}&locale=es_ES&state=${id}`;
    return tinkLink;
  } else {
    throw new Error("Tink not support in your country.");
  }
};

const handleCallbackForTransection = async (code: string, userId: string) => {
  const getToken = await User.findById(userId);
  let token: string;
  try {
    const isTokenValid = (accessToken?: string): boolean => {
      if (!accessToken) return false;

      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        const isExpired = decoded.exp * 1000 < Date.now(); // convert to ms
        return !isExpired;
      } catch (err) {
        return false;
      }
    };

    if (isTokenValid(getToken?.bankAccessToken)) {
      token = getToken!.bankAccessToken;
    } else {
      token = await TinkAcceesToken.getAccessTokenWithCode(code);
      await User.findByIdAndUpdate(userId, { bankAccessToken: token });
    }

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Status</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
    
        .loading, .success, .error {
          padding: 20px;
          border-radius: 5px;
          margin-top: 50px;
        }
    
        .loading {
          background-color: #f0f8ff;
          color: #333;
        }
    
        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
    
        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
    
        .spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
    
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <h1>Transaction Submission</h1>
    
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>Data is storing in Database...</p>
      </div>
    
      <div id="success" class="success" style="display: none;">
        ✅ Transactions stored successfully!
      </div>
    
      <div id="error" class="error" style="display: none;"></div>
    
      <script>
        const userId = "${userId}";
    
        async function storeTransaction() {
          try {
            const response = await fetch('http://192.168.10.18:5000/api/bank/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({userId})
            });
    
            document.getElementById('loading').style.display = 'none';
    
            if (!response.ok) {
              throw new Error('Status: ' + response.status);
            }
    
            document.getElementById('success').style.display = 'block';
          } catch (err) {
            document.getElementById('error').textContent = '❌ Error: ' + err.message;
            document.getElementById('error').style.display = 'block';
          }
        }
    
        window.addEventListener('DOMContentLoaded', storeTransaction);
      </script>
    </body>
    </html>`;
  } catch (error: any) {
    logger.error("Error in handleCallbackForTransaction:", error);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
      </head>
      <body>
        <h1>Error</h1>
        <p>Failed to initialize transaction data: ${error.message}</p>
      </body>
      </html>
    `;
  }
};

// work auto when user connect bank
const saveAllTransection = async (userId: string) => {
  console.log("object");
  const today = dayjs().format("YYYY-MM-DD");
  const threeDaysAgo = dayjs().subtract(2, "day").format("YYYY-MM-DD");
  const userData = await User.findById(userId);

  const params: Record<string, unknown> = {
    pageSize: 2,
    bookedDateGte: threeDaysAgo,
    bookedDateLte: today,
  };

  const allTransactions: IBankTransaction[] = [];

  let nextPageToken: string | undefined = undefined;

  do {
    if (!!nextPageToken) {
      params.pageToken = nextPageToken;
    }
    const response = await axios.get(
      `${appConfig.tink.baseUrl}/data/v2/transactions`,
      {
        headers: {
          Authorization: `Bearer ${userData?.bankAccessToken}`,
        },
        params,
      }
    );

    const transactions = response.data.transactions.map((tx: any) => ({
      tId: tx.id,
      accId: tx.accountId,
      amount: {
        value: {
          unscaledValue: tx.amount.value.unscaledValue,
          scale: tx.amount.value.scale,
        },
        currencyCode: tx.amount.currencyCode,
      },
      descriptions: {
        display: tx.descriptions.display,
      },
      status: tx.status,
      user: userId,
    }));

    allTransactions.push(...transactions);

    nextPageToken = response.data.nextPageToken;
  } while (!!nextPageToken);

  const transactionIds = allTransactions.map((tx) => tx.tId);

  const existingTxs = await BankTransaction.find(
    { tId: { $in: transactionIds } },
    { tId: 1 }
  ).lean();

  const existingIds = new Set(existingTxs.map((tx) => tx.tId));

  // Filter out already existing transactions
  const filteredTransactions = allTransactions.filter(
    (tx) => !existingIds.has(tx.tId)
  );
  console.dir(filteredTransactions, { depth: null });
  if (filteredTransactions.length > 0) {
    await BankTransaction.insertMany(filteredTransactions, { ordered: false });
    console.log(filteredTransactions, "GG");
  }

  return { message: "Bank data saved to database" };
};

const fetchBankData = async (userId: string) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  // Fetch only necessary fields
  const bankData = await BankTransaction.find({
    user: userId,
    createdAt: { $gte: start, $lte: end },
  }).lean();

  const txIds = bankData.map((tx) => tx.tId);

  // Parallel fetch for categorization
  const [expenses, incomes, savings] = await Promise.all([
    Expense.find({ tId: { $in: txIds } })
      .select("tId")
      .lean(),
    Income.find({ tId: { $in: txIds } })
      .select("tId")
      .lean(),
    Savings.find({ tId: { $in: txIds } })
      .select("tId")
      .lean(),
  ]);

  const categorisedIds = new Set<string>();
  for (const doc of [...expenses, ...incomes, ...savings]) {
    if (doc.tId) {
      categorisedIds.add(doc.tId.toString());
    }
  }

  // Split data into two arrays
  const categorised: any[] = [];
  const nonCategorised: any[] = [];

  for (const item of bankData) {
    const { unscaledValue, scale } = item.amount.value;
    const actualAmount = Number(unscaledValue) / Math.pow(10, Number(scale));

    const transformed = {
      ...item,
      amount: {
        ...item.amount,
        actualAmount,
      },
    };

    if (categorisedIds.has(item.tId.toString())) {
      categorised.push({ ...transformed, isCategorised: true });
    } else {
      nonCategorised.push({ ...transformed, isCategorised: false });
    }
  }

  return {
    categorised,
    nonCategorised,
  };
};

const categoriseAllTransection = async (
  userId: string,
  data: IBankTransaction[]
) => {
  const dataTid = data.map((datas) => datas.tId);

  const [expenses, incomes, savings] = await Promise.all([
    Expense.find({ tId: { $in: dataTid } })
      .select("tId")
      .lean(),
    Income.find({ tId: { $in: dataTid } })
      .select("tId")
      .lean(),
    Savings.find({ tId: { $in: dataTid } })
      .select("tId")
      .lean(),
  ]);

  const existingTIds = new Set([
    ...expenses.map((e) => e.tId),
    ...incomes.map((i) => i.tId),
    ...savings.map((s) => s.tId),
  ]);

  const filteredData = data.filter(
    (transaction) => !existingTIds.has(transaction.tId)
  );

  const result = await processTransactionsByGemini(
    { transactions: filteredData },
    userId
  );
  return result;
};

export const TintService = {
  getBankTransectionUrl,
  handleCallbackForTransection,
  fetchBankData,
  saveAllTransection,
  categoriseAllTransection,
};
