/* eslint-disable @typescript-eslint/no-unused-vars */
export interface IAuthData {
  userEmail: string;
  userId: string;
  userRole: TUserRole;
}

export const userRole = ["ADMIN", "USER"] as const;

export type TUserRole = (typeof userRole)[number];
