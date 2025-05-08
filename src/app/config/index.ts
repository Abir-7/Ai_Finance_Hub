import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const appConfig = {
  database: { dataBase_uri: process.env.DATABASE_URI },
  server: {
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
    ip: process.env.IP_ADDRESS,
    baseUrl: process.env.BASE_URL,
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
  email: {
    from: process.env.EMAIL_FROM,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT as string),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  multer: {
    file_size_limit: process.env.MAX_FILE_SIZE,
    max_file_number: process.env.MAX_COUNT_FILE,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  aiKey: {
    openAi: { key: process.env.GPT_KEY },
    geminiAi: { key: process.env.GEMINI_KEY },
  },
  goCardLess: {
    id: process.env.GCL_SECRETE_ID,
    key: process.env.GCL_SECRETE_KEY,
    baseUrl: process.env.GCL_BASE_URL,
  },
  tink: {
    id: process.env.TINK_ID,
    key: process.env.TINK_SECRETE,
    baseUrl: process.env.TINK_BASE_URL,
  },
  plaid: {
    id: process.env.PLAID_CLIENT_ID,
    key: process.env.PLAID_SECRET,
    plaid_env: process.env.PLAID_ENV,
    plaidBaseUrl: process.env.PLAID_API_URL,
  },
};
