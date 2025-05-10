/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { IncomeService } from "../../modules/finance/income/income.service";
import { ExpenseService } from "../../modules/finance/expense/expense.service";
import { Savings } from "../../modules/finance/savings/savings.model";
import { genAI } from "./geminiAi";
import { IBankTransaction } from "../../modules/bank/tink/tink.interface";

const convertAmount = (amount: IBankTransaction["amount"]): number => {
  const { unscaledValue, scale } = amount.value;
  return Math.abs(Number(unscaledValue) / 10 ** Number(scale));
};

export const ALLOWED_EXPENSE_CATEGORIES = [
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

const buildPrompt = (transactions: IBankTransaction[]) => {
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
  { "id": "xyz", "type": "expense", "category": "food_dining" }
]

Data: ${JSON.stringify(simplified)}
`.trim();
};

const batchClassifyTransactions = async (transactions: IBankTransaction[]) => {
  const prompt = buildPrompt(transactions);
  console.log("🧠 Prompt:\n", prompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🧽 Clean and extract JSON from Gemini response
    const cleanJson = text
      .replace(/^```json\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const firstBracketIndex = cleanJson.indexOf("[");
    const lastBracketIndex = cleanJson.lastIndexOf("]");

    if (firstBracketIndex === -1 || lastBracketIndex === -1) {
      throw new Error("No valid JSON array found in Gemini response");
    }

    const jsonString = cleanJson.substring(
      firstBracketIndex,
      lastBracketIndex + 1
    );
    const resultJson = JSON.parse(jsonString);

    return transactions.map((tx) => {
      const found = resultJson.find((r: any) => r.id === tx.id) || {};
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
    console.warn("⚠️ Gemini Error:", err?.message || err);

    // Fallback: return safe default mapping
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

export const processTransactionsByGemini = async (
  data: { transactions: IBankTransaction[] },
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

  private getCacheKey({ descriptions, amount }: IBankTransaction) {
    return `${descriptions.display}:${amount.value.unscaledValue}`;
  }

  async classify(transactions: IBankTransaction[]) {
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
