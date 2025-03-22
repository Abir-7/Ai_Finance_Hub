import { z } from "zod";

export const zodExpenseSchema = z
  .object({
    body: z.object({
      amount: z.number(),
      category: z.string(),
      method: z.string(),
      note: z.string().optional(),
      description: z.object({
        info: z.string(),
      }),
    }),
  })
  .strict();
