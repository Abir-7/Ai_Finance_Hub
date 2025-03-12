import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const appConfig = {
  server: {
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
    ip: process.env.IP_ADDRESS,
    dataBase_uri: process.env.DATABASE_URI,
  },

  jwt: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_exprire: process.env.JWT_ACCESS_EXPIRE,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_exprire: process.env.JWT_REFRESH_EXPIRE,
  },
  bcrypt: {
    salt_round: process.env.SALT_ROUND,
  },
};
