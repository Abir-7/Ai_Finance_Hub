/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import { userRole } from "../../../interface/auth.interface";
import bcrypt from "bcryptjs";
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: userRole, default: "USER" },
    authentication: {
        expDate: { type: Date, default: null },
        otp: { type: Number, default: null },
        token: { type: String, default: null },
    },
    isVerified: { type: Boolean, default: false },
    needToResetPass: { type: Boolean, default: false },
});
userSchema.methods.comparePassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    }
    catch (error) {
        throw new Error("Error comparing password");
    }
};
const User = model("User", userSchema);
export default User;
