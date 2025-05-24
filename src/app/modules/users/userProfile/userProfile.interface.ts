// userProfile.interface.ts
import { Types } from "mongoose";

// ✅ Proper enum declaration
export enum TinkCountryCode {
  AUSTRIA = "AT",
  BELGIUM = "BE",
  DENMARK = "DK",
  ESTONIA = "EE",
  FINLAND = "FI",
  FRANCE = "FR",
  GERMANY = "DE",
  IRELAND = "IE",
  ITALY = "IT",
  LATVIA = "LV",
  LITHUANIA = "LT",
  NETHERLANDS = "NL",
  NORWAY = "NO",
  POLAND = "PL",
  PORTUGAL = "PT",
  SPAIN = "ES",
  SWEDEN = "SE",
  UNITED_KINGDOM = "GB",
  NONE = "NONE",
}

// ✅ Profession literal type
export const profession = ["Business Men", "Job Holder"] as const;
export type TProfession = (typeof profession)[number];

// ✅ User Profile interface
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
  country: TinkCountryCode; // ✅ Use enum type directly
}
