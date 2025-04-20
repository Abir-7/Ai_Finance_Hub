/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import axios from "axios";
import { appConfig } from "../../../config";

const getLinkToken = async (userId: string) => {
  const url = `${appConfig.plaid.plaidBaseUrl}/link/token/create`;

  const data = {
    client_id: appConfig.plaid.id,
    secret: appConfig.plaid.key,
    user: {
      client_user_id: userId,
    },
    client_name: "Your App Name",
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
  };

  const response = await axios.post(url, data);
  const plaidLinkUrl = `https://plaid.com/link/token/${response.data.link_token}`;

  return plaidLinkUrl;
};

// const getLinkToken = async (userId: string) => {
//   const url = `${appConfig.plaid.plaidBaseUrl}/link/token/create`;

//   const data = {
//     client_id: appConfig.plaid.id,
//     secret: appConfig.plaid.key,
//     user: {
//       client_user_id: userId,
//     },
//     client_name: "Your App Name",
//     products: ["transactions"],
//     country_codes: ["US"],
//     language: "en",
//   };

//   const response = await axios.post(url, data);
//   return response.data.link_token;
// };

const exchangePublicToken = async (publicToken: string) => {
  const url = `${appConfig.plaid.plaidBaseUrl}/item/public_token/exchange`;

  const data = {
    client_id: appConfig.plaid.id,
    secret: appConfig.plaid.key,
    public_token: publicToken,
  };

  const response = await axios.post(url, data);
  return response.data.access_token;
};

export const PlaidService = {
  getLinkToken,
  exchangePublicToken,
};
