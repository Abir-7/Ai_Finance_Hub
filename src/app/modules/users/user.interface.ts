import { Document } from "mongoose";
import { TUserRole } from "../../interface/auth.interface";

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: TUserRole;

  // Static methods
  hashPassword(password: string): Promise<string>;
  // Instance methods
  comparePassword(
    enteredPassword: string,
    storedPassword: string
  ): Promise<boolean>;
}
