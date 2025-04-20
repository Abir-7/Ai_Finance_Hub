import { Schema, model } from "mongoose";
import { IUserProfile, profession } from "./userProfile.interface";

const userProfileSchema = new Schema<IUserProfile>({
  fullName: { type: String, default: null },
  nickname: { type: String, default: null },
  dateOfBirth: { type: String, default: null },
  email: { type: String, unique: true },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  image: { type: String, default: null },
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  profession: {
    type: String,
    enum: profession,
    default: null,
  },
});

export const UserProfile = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);
