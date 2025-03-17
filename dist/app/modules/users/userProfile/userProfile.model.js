import { Schema, model } from "mongoose";
const userProfileSchema = new Schema({
    fullName: { type: String },
    nickname: { type: String },
    dateOfBirth: { type: Date },
    email: { type: String, unique: true },
    phone: { type: String },
    address: { type: String },
    image: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
});
export const UserProfile = model("UserProfile", userProfileSchema);
