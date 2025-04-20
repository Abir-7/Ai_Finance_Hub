import { Types } from "mongoose";

export interface IUserProfile {
  _id: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  user: Types.ObjectId;
  profession: TProfession;
}

export const profession = ["Business Men", "Job Holder"] as const;
type TProfession = (typeof profession)[number];
