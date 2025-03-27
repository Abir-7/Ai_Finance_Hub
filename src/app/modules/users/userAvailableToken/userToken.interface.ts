import { Types } from "mongoose";

export interface IUserToken {
  user: Types.ObjectId;
  tokenLimit: 6;
}
