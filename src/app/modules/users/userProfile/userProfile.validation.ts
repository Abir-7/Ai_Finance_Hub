import { z } from "zod";
export const zodUpdateUserProfileSchema = z
  .object({
    body: z.object({
      fullName: z.string().optional(),
      nickname: z.string().optional(),
      dateOfBirth: z.string(),
      phone: z.string().optional(),
      address: z.string().optional(),
      image: z.string().optional(),
      profession: z.string().optional(),
    }),
  })
  .strict();
