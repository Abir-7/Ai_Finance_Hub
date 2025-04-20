/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from "axios";
import { appConfig } from "../../../config";
import User from "../../users/user/user.model";
import AppError from "../../../errors/AppError";
import status from "http-status";
import dayjs from "dayjs";
import logger from "../../../utils/logger";
import { TinkAcceesToken } from "../../../utils/Tink_Bank_api/getAccessToken";

const getBankTransectionUrl = async (url: string, id: string) => {
  const tinkLink = `https://link.tink.com/1.0/transactions/connect-accounts/?client_id=6349c4f9d0f344ea9c1822610ba51cf4&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Ftink-bank%2Fcallback&market=ES&locale=en_US&state=${id}`;
  return tinkLink;
};

const getBankIncomeUrl = async (url: string, id: string) => {
  const tinkLink = `https://link.tink.com/1.0/income-check/create-report/?client_id=6349c4f9d0f344ea9c1822610ba51cf4&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Ftink-bank%2Fcallback&market=ES&locale=en_US&state=${id}`;
  return tinkLink;
};

const getBankAccountIdlist = async (token: string, userId: string) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const response = await axios.get("https://api.tink.com/data/v2/accounts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const accounts = response.data.accounts;
  return accounts;
};

const fetchBankData = async (
  id: string,
  token: string,
  nextPageToken?: string,
  accountId?: string
) => {
  const today = dayjs().format("YYYY-MM-DD");

  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const params: Record<string, unknown> = {
    pageSize: 100,
    // bookedDateGte: today,
    // bookedDateLte: today,
  };

  if (!!nextPageToken) {
    params.pageToken = nextPageToken;
  }
  if (accountId) {
    params.accountIdIn = accountId;
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
  return response.data;
};

const handleCallbackForTransection = async (
  code: string,
  userId: string,
  income_check_id: string
) => {
  logger.info(userId);
  if (income_check_id) {
    const token = await TinkAcceesToken.getAccessTokenWithOutCode();

    const response = await axios.get(
      `https://api.tink.com/v2/income-checks/${income_check_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.dir(response.data, { depth: null });
    return { token };
  } else {
    const token = await TinkAcceesToken.getAccessTokenWithCode(code);

    const response = await axios.get("https://api.tink.com/data/v2/accounts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    logger.info(token);

    const accounts = response.data.accounts;
    console.log(accounts);
    const filteredAccounts = accounts.map((account: any) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      currencyCode: account.balances?.available?.amount?.currencyCode,
      iban: account.identifiers?.iban?.iban,
    }));

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Available Bank Accounts</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #2E8B57;
          color: white;
          margin: 0;
          padding: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 30px;
        }
        .account-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        .account-card {
          background-color: #3CB371;
          border-radius: 10px;
          padding: 20px;
          width: 300px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .account-card h3 {
          margin-top: 0;
        }
        .label {
          font-weight: bold;
        }
        .iban {
          font-family: monospace;
        }
        button {
          margin-top: 10px;
          padding: 8px 12px;
          border: none;
          background-color: white;
          color: #2E8B57;
          font-weight: bold;
          cursor: pointer;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Available Bank Accounts</h1>
      <div class="account-list">
        ${filteredAccounts
          .map(
            (account: any) => `
            <div class="account-card">
              <h3>${account.name}</h3>
              <p><span class="label">Type:</span> ${account.type}</p>
              <p><span class="label">Currency:</span> ${account.currencyCode}</p>
              <p><span class="label">IBAN:</span> <span class="iban">${account.iban}</span></p>
              <button onclick="selectAccount('${account.id}', '${account.name}', '${account.type}', '${account.currencyCode}', '${account.iban}')">Select</button>
            </div>
          `
          )
          .join("")}
      </div>

      <script>
        function selectAccount(id, name, type, currencyCode, iban) {
          fetch('${appConfig.server.baseUrl}/api/tink-bank/save-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, name, type, currencyCode, iban })
          })
          .then(res => res.json())
          .then(data => {
            alert(data.message || 'Account saved!');
          })
          .catch(err => {
            console.error(err);
            alert('Error saving account.');
          });
        }
      </script>
    </body>
    </html>
  `;

    return html;
  }
};

const saveBankAccount = async (data: any) => {
  console.log(data);
};

export const TintService = {
  getBankTransectionUrl,
  getBankIncomeUrl,
  handleCallbackForTransection,
  fetchBankData,
  getBankAccountIdlist,
  saveBankAccount,
};
