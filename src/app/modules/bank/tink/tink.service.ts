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

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const getBankTransectionUrl = async (id: string) => {
  const tinkLink = `https://link.tink.com/1.0/transactions/connect-accounts/?client_id=${appConfig.tink.id}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fbank%2Fcallback&market=ES&locale=es_ES&state=${id}`;
  return tinkLink;
};

// const getBankAccountIdlist = async (token: string, userId: string) => {
//   const isUserExist = await User.findById(userId);
//   if (!isUserExist) {
//     throw new AppError(status.NOT_FOUND, "User not found");
//   }

//   const response = await axios.get("https://api.tink.com/data/v2/accounts", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const accounts = response.data.accounts;
//   return accounts;
// };

// const fetchBankData = async (
//   id: string,
//   token: string,
//   nextPageToken?: string,
//   accountId?: string
// ) => {
//   const today = dayjs().format("YYYY-MM-DD");

//   const isUserExist = await User.findById(id);
//   if (!isUserExist) {
//     throw new AppError(status.NOT_FOUND, "User not found");
//   }

//   const params: Record<string, unknown> = {
//     pageSize: 100,
//     bookedDateGte: today,
//     bookedDateLte: today,
//   };

//   if (!!nextPageToken) {
//     params.pageToken = nextPageToken;
//   }
//   if (accountId) {
//     params.accountIdIn = accountId;
//   }

//   const response = await axios.get(
//     `${appConfig.tink.baseUrl}/data/v2/transactions`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       params,
//     }
//   );
//   return response.data;
// };

// const handleCallbackForTransection = async (code: string, userId: string) => {
//   logger.info({ userId, code });

//   const token = await TinkAcceesToken.getAccessTokenWithCode(code);
//   const today = dayjs().format("YYYY-MM-DD");

//   const params: Record<string, unknown> = {
//     pageSize: 2,
//     bookedDateGte: today,
//     bookedDateLte: today,
//   };

//   const allTransactions: any[] = [];

//   let nextPageToken: string | undefined = undefined;

//   do {
//     if (!!nextPageToken) {
//       params.pageToken = nextPageToken;
//     }

//     const response = await axios.get(
//       `${appConfig.tink.baseUrl}/data/v2/transactions`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params,
//       }
//     );
//     console.log(response.data);
//     const transactions = response.data.transactions.map((t: any) => {
//       const unscaled = parseFloat(t.amount.value.unscaledValue);
//       const scale = parseInt(t.amount.value.scale);
//       const realAmount = unscaled / 10 ** scale;

//       return {
//         id: t.id,
//         accountId: t.accountId,
//         unscaledValue: t.amount.value.unscaledValue,
//         scale: t.amount.value.scale,
//         currencyCode: t.amount.currencyCode,
//         description: t.descriptions.display,
//         status: t.status,
//         amount: Math.abs(realAmount),
//       };
//     });

//     allTransactions.push(...transactions);

//     nextPageToken = response.data.nextPageToken;
//   } while (!!nextPageToken);

//   // const bankData = await BankTransaction.insertMany(allTransactions, {
//   //   ordered: false,
//   // });

//   return { allTransactions };
// };

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
        const token = "${token}";
    
        async function storeTransaction() {
          try {
            const response = await fetch('http://192.168.10.18:5000/api/bank/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, userId })
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

const getAllTransection = async (tokenData: string, userId: string) => {
  const token = tokenData;
  const today = dayjs().format("YYYY-MM-DD");

  const params: Record<string, unknown> = {
    pageSize: 2,
    bookedDateGte: today,
    bookedDateLte: today,
  };

  const allTransactions: any[] = [];

  let nextPageToken: string | undefined = undefined;

  do {
    if (!!nextPageToken) {
      params.pageToken = nextPageToken;
    }
    const response = await axios.get(
      `${appConfig.tink.baseUrl}/data/v2/transactions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );
    const transactions = response.data.transactions.map((tx: any) => ({
      id: tx.id,
      accountId: tx.accountId,
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
    }));

    allTransactions.push(...transactions);

    nextPageToken = response.data.nextPageToken;
  } while (!!nextPageToken);
  console.log(allTransactions);
  await BankTransaction.insertMany(allTransactions, {
    ordered: false,
  });

  return { message: "Bank data saved to database" };
};

// const saveBankAccount = async (data: any) => {
//   console.log(data);
// };

export const TintService = {
  getBankTransectionUrl,
  handleCallbackForTransection,
  // fetchBankData,
  // getBankAccountIdlist,
  // saveBankAccount,
  getAllTransection,
};
