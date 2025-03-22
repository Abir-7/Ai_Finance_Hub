import { z } from "zod";

export const zodIncomeSchema = z.object({
  body: z.object({
    amount: z.number(),
    source: z.string(),
    method: z.string(),
    note: z.string().optional(),
    description: z.object({
      info: z.string(),
    }),
  }),
});
