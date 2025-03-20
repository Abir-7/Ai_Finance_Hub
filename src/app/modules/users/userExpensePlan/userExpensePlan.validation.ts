import { z } from "zod";

// Schema for the "balance" field
const balanceSchema = z
  .object({
    income: z.number(),
    expense: z.number(),
  })
  .strict();

// Schema for the "expenseLimit" field
const expenseLimitSchema = z
  .object({
    food: z.number(),
    social: z.number(),
    pets: z.number(),
    education: z.number(),
    gift: z.number(),
    transport: z.number(),
    rent: z.number(),
    apparel: z.number(),
    beauty: z.number(),
    health: z.number(),
    other: z.number(),
  })
  .strict();

// Create schema: both balance and expenseLimit are required and unknown keys are rejected.
export const zodCreateUserExpensePlanSchema = z
  .object({
    body: z.object({
      balance: balanceSchema,
      expenseLimit: expenseLimitSchema,
    }),
  })
  .strict();

// Update schema: fields are optional and unknown keys are rejected at the top level.
// Note: Nested schemas remain strict.
export const zodUpdateUserExpensePlanSchema = z
  .object({
    body: z.object({
      balance: balanceSchema.partial().optional(),
      expenseLimit: expenseLimitSchema.partial().optional(),
    }),
  })
  .strict();
