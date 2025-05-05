/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { IncomeService } from "../../modules/finance/income/income.service";
import { ExpenseService } from "../../modules/finance/expense/expense.service";
import { openai } from "./openAi";
import { Savings } from "../../modules/finance/savings/savings.model";

export interface ITransaction {
  id: string;
  accountId: string;
  amount: {
    value: {
      unscaledValue: string;
      scale: string;
    };
    currencyCode: string;
  };
  descriptions: {
    original: string;
    display: string;
  };
  dates: {
    booked: string;
  };
  identifiers: {
    providerTransactionId: string;
  };
  types: {
    type: string;
  };
  status: string;
  providerMutability: string;
}

const convertAmount = (amount: ITransaction["amount"]): number => {
  const { unscaledValue, scale } = amount.value;
  return Math.abs(Number(unscaledValue) / 10 ** Number(scale));
};

const ALLOWED_EXPENSE_CATEGORIES = [
  "food_dining",
  "transportation",
  "utilities",
  "health_medical",
  "entertainment",
  "shopping",
  "education",
  "travel",
  "rent_mortgage",
  "personal_care",
  "insurance",
  "transfer",
  "other",
];

const ALLOWED_INCOME_SOURCES = [
  "salary",
  "freelance",
  "investments",
  "gifts",
  "refunds",
  "transfer",
  "other",
];

const buildPrompt = (transactions: ITransaction[]) => {
  const simplified = transactions.map((t) => ({
    id: t.id,
    d: t.descriptions.display,
    a: t.amount.value.unscaledValue,
    s: parseInt(t.amount.value.unscaledValue) > 0 ? "+" : "-",
  }));

  return `
You are a financial AI. Classify each transaction as "income" or "expense" using "s":
- s = "+" → income (must include a source)
- s = "-" → expense (must include a category)

Allowed sources: ${ALLOWED_INCOME_SOURCES}
Allowed categories: ${ALLOWED_EXPENSE_CATEGORIES}


Return a valid JSON array like:
[
  { "id": "abc", "type": "income", "source": "salary" },
  { "id": "xyz", "type": "expense", "category": "food" }
]

Data: ${JSON.stringify(simplified)}
`.trim();
};

const batchClassifyTransactions = async (transactions: ITransaction[]) => {
  const prompt = buildPrompt(transactions);
  console.log(prompt);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");

    return transactions.map((tx) => {
      const found = result.transactions?.find((r: any) => r.id === tx.id) || {};
      const amount = convertAmount(tx.amount);
      const type =
        found.type ||
        (parseInt(tx.amount.value.unscaledValue) > 0 ? "income" : "expense");

      const category = (found.category || "").toLowerCase();
      const source = (found.source || "").toLowerCase();

      return {
        id: tx.id,
        accId: tx.accountId,
        type,
        amount,
        description: tx.descriptions.display,
        ...(type === "expense"
          ? {
              category: ALLOWED_EXPENSE_CATEGORIES.includes(category)
                ? category
                : "other",
            }
          : {}),
        ...(type === "income"
          ? {
              source: ALLOWED_INCOME_SOURCES.includes(source)
                ? source
                : "other",
            }
          : {}),
      };
    });
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || "";
    console.warn("⚠️ OpenAI Error:", msg);

    return transactions.map((tx) => {
      const amount = convertAmount(tx.amount);
      const type =
        parseInt(tx.amount.value.unscaledValue) > 0 ? "income" : "expense";
      return {
        id: tx.id,
        accId: tx.accountId,
        type,
        amount,
        description: tx.descriptions.display,
        ...(type === "expense" ? { category: "other" } : {}),
        ...(type === "income" ? { source: "other" } : {}),
      };
    });
  }
};

export const processTransactions = async (
  data: { transactions: ITransaction[] },
  userId: string
) => {
  const BATCH_SIZE = 20;
  const { transactions } = data;

  const batches = Array.from(
    { length: Math.ceil(transactions.length / BATCH_SIZE) },
    (_, i) => transactions.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
  );

  const results = await Promise.all(batches.map(batchClassifyTransactions));

  const classified = results.flat();

  for (const tx of classified) {
    try {
      if (tx.type === "expense") {
        if (tx.category === "transfer") {
          await Savings.create({
            tId: tx.id,
            accId: tx.accId,
            amount: tx.amount,
          });
        } else {
          await ExpenseService.addExpenseByAi(
            [],
            {
              user: new mongoose.Types.ObjectId(userId),
              method: "card",
              amount: tx.amount,
              description: { images: [], info: tx.description },
              category: tx.category || "other",
            },
            userId,
            tx.id,
            tx.accId
          );
        }

        console.log(
          `💸 Saved expense: ${tx.description} (${tx.category}, €${tx.amount})`
        );
      } else {
        if (tx.source === "transfer") {
          await Savings.create({
            tId: tx.id,
            accId: tx.accId,
            amount: tx.amount,
          });
        } else {
          await IncomeService.addIncomeByAi(
            [],
            {
              amount: tx.amount,
              description: { info: tx.description },
              user: new mongoose.Types.ObjectId(userId),
              source: tx.source || "other",
              method: "card",
            },
            userId,
            tx.id,
            tx.accId
          );
        }

        console.log(
          `💰 Saved income: ${tx.description} (${tx.source}, €${tx.amount})`
        );
      }
    } catch (error) {
      console.error(`❌ Error saving transaction ${tx.id}:`, error);
    }
  }

  console.log("✅ All transactions processed");
};

export class TransactionClassifier {
  private cache = new Map<string, any>();

  private getCacheKey({ descriptions, amount }: ITransaction) {
    return `${descriptions.display}:${amount.value.unscaledValue}`;
  }

  async classify(transactions: ITransaction[]) {
    const uncached = transactions.filter(
      (t) => !this.cache.has(this.getCacheKey(t))
    );
    const newlyClassified =
      uncached.length > 0 ? await batchClassifyTransactions(uncached) : [];

    for (const tx of newlyClassified) {
      const original = uncached.find((t) => t.id === tx.id);
      if (original) this.cache.set(this.getCacheKey(original), tx);
    }

    return transactions.map((t) => {
      const key = this.getCacheKey(t);
      return (
        this.cache.get(key) || {
          id: t.id,
          type:
            parseInt(t.amount.value.unscaledValue) > 0 ? "income" : "expense",
          amount: convertAmount(t.amount),
          description: t.descriptions.display,
          ...(parseInt(t.amount.value.unscaledValue) > 0
            ? { source: "other" }
            : { category: "other" }),
        }
      );
    });
  }
}
