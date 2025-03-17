/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { appConfig } from "../../config";
import bcrypt from "bcryptjs";
const getHashedPassword = async (password) => {
    try {
        return await bcrypt.hash(password, Number(appConfig.bcrypt.salt_round));
    }
    catch (error) {
        throw new Error("Error hashing password");
    }
};
export default getHashedPassword;
