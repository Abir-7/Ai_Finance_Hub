import axios from "axios";
import { appConfig } from "../../config";

const getAccessTokenWithCode = async (code: string) => {
  const data = new URLSearchParams();
  data.append("client_id", appConfig.tink.id as string);
  data.append("client_secret", appConfig.tink.key as string);
  data.append("code", code);
  data.append("grant_type", "authorization_code");
  const response = await axios.post(
    `${appConfig.tink.baseUrl}/api/v1/oauth/token`,
    data.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};
const getAccessTokenWithOutCode = async () => {
  const data = new URLSearchParams();
  data.append("client_id", appConfig.tink.id as string);
  data.append("client_secret", appConfig.tink.key as string);
  data.append("grant_type", "client_credentials");
  const response = await axios.post(
    `${appConfig.tink.baseUrl}/api/v1/oauth/token`,
    data.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};
export const TinkAcceesToken = {
  getAccessTokenWithCode,
  getAccessTokenWithOutCode,
};
