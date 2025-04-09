/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from "axios";
import { appConfig } from "../../config";
const BASE_URL = appConfig.goCardLess.baseUrl;

const initToken = async () => {
  const { data } = await axios.post(`${BASE_URL}/token/new/`, {
    secret_id: appConfig.goCardLess.id,
    secret_key: appConfig.goCardLess.key,
  });

  const accessToken = data.access;
  return accessToken;
};

const getInstitutions = async (country = "GB") => {
  const token = await initToken();

  const { data } = await axios.get(
    `${BASE_URL}/institutions/?country=${country}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data;
};

const createRequisition = async (institutionId: string, userId: string) => {
  const token = await initToken();

  const { data } = await axios.post(
    `${BASE_URL}/requisitions/`,
    {
      redirect: "https://httpbin.org/get", //!change to app
      institution_id: institutionId,
      reference: `user-${userId}-${Date.now()}`,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return { id: data.id, link: data.link }; // contains link to redirect user to bank
};

const getTransactions = async (accountId: string) => {
  const token = await initToken();
  const { data } = await axios.get(
    `${BASE_URL}/accounts/${accountId}/transactions/`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data.transactions;
};

const getAccountsId = async (requisitionId: string) => {
  const token = await initToken();
  // your existing token method
  console.log(requisitionId, token);
  const { data } = await axios.get(
    `${appConfig.goCardLess.baseUrl}/requisitions/${requisitionId}/`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data.accounts; // this will be an array of account IDs
};

export const BankService = {
  getInstitutions,
  createRequisition,
  getTransactions,
  getAccountsId,
};
