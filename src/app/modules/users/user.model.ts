/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";
import { userRole } from "../../interface/auth.interface";
import { appConfig } from "../../config";
import bcrypt from "bcryptjs";
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: userRole, default: "USER" },
});

userSchema.statics.hashPassword = async function (password: string) {
  try {
    return await bcrypt.hash(password, Number(appConfig.bcrypt.salt_round));
  } catch (error: any) {
    throw new Error("Error hashing password");
  }
};

userSchema.statics.comparePassword = async function (
  enteredPassword: string,
  storedPassword: string
) {
  try {
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (error) {
    throw new Error("Error comparing password");
  }
};

const User = model<IUser>("User", userSchema);

export default User;
