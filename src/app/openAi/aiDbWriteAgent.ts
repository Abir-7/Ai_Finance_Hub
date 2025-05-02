import mongoose from "mongoose";
import { IncomeService } from "./../modules/finance/income/income.service";
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { IExpense } from "../modules/finance/expense/expense.interface";
import Expense from "../modules/finance/expense/expense.model";
import { IIncome } from "../modules/finance/income/income.interface";

import { openai } from "./openAi";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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

// Function to convert transaction amount to number
const convertAmount = (amount: ITransaction["amount"]): number => {
  const { unscaledValue, scale } = amount.value;
  return Math.abs(parseInt(unscaledValue) / Math.pow(10, parseInt(scale)));
};

// Batch classify transactions (type, category, source) in a single API call
const batchClassifyTransactions = async (
  transactions: ITransaction[]
): Promise<
  Array<{
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    category?: IExpense["category"];
    source?: IIncome["source"];
  }>
> => {
  const transactionsData = transactions.map((t) => ({
    id: t.id,
    description: t.descriptions.display,
    amount: t.amount.value.unscaledValue,
    amountSign:
      parseInt(t.amount.value.unscaledValue) > 0 ? "positive" : "negative",
  }));

  const prompt = `
    Classify the following financial transactions.
    For each transaction:
    1. Determine if it's "income" or "expense" (negative amount usually means expense, positive usually means income)
    2. If it's an expense, classify it into one of these categories:   
    "food",
  "social",
  "pets",
  "education",
  "gift",
  "transport",
  "rent",
  "apparel",
  "beauty",
  "health",
  "other",
  "shopping",
  "groceries",
  "housing",
  "entertainment",
  "bills",
  "utilities",

    3. **If it's income, classify the source into one of these categories: salary, petty cash, bonus, other**
    
    Note: "fuel" expenses should be classified as "transport".

    Transactions:
    ${JSON.stringify(transactionsData, null, 2)}

    Return a JSON array with this format:
    [
      {
        "id": "transaction-id",
        "type": "income|expense",
        "category": "category-name" (only for expenses),
        "source": "source-name" (only for incomes)
      }
    ]
    
    Only return the JSON array, nothing else.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = await JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // Map the results back to our transactions with the converted amount
    return transactions.map((transaction) => {
      const classification =
        result.transactions.find((r: any) => r.id === transaction.id) || {};
      const amount = convertAmount(transaction.amount);
      const description = transaction.descriptions.display;

      return {
        id: transaction.id,
        type: classification.type || "expense", // Default to expense if classification failed
        amount,
        description,
        ...(classification.type === "expense"
          ? { category: classification.category || "other" }
          : {}),
        ...(classification.type === "income"
          ? { source: classification.source || "other" }
          : {}),
      };
    });
  } catch (error) {
    console.error("Error in batch classification:", error);
    // Fallback: classify transactions individually with simpler logic
    return transactions.map((transaction) => {
      const amount = convertAmount(transaction.amount);
      const description = transaction.descriptions.display;
      const type =
        parseInt(transaction.amount.value.unscaledValue) > 0
          ? "income"
          : "expense";

      return {
        id: transaction.id,
        type,
        amount,
        description,
        ...(type === "expense" ? { category: "other" } : {}),
        ...(type === "income" ? { source: "other" } : {}),
      };
    });
  }
};

// Process transactions in batches
export const processTransactions = async (
  data: { transactions: ITransaction[] },
  userId: string
) => {
  const BATCH_SIZE = 20; // Adjust based on your needs and API limits
  const transactions = data.transactions;

  console.log(
    `Processing ${transactions.length} transactions in batches of ${BATCH_SIZE}`
  );

  // Process in batches
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        transactions.length / BATCH_SIZE
      )}`
    );

    try {
      const classifiedTransactions = await batchClassifyTransactions(batch);

      // Process the classified transactions (save to DB, etc.)
      for (const transaction of classifiedTransactions) {
        if (transaction.type === "expense" && transaction.category) {
          // Save expense to database
          // Uncomment this when you're ready to save to the database

          await Expense.create({
            user: userId,
            method: "card",
            amount: transaction.amount,
            description: {
              images: [],
              info: transaction.description,
            },

            category: transaction.category,
            date: new Date(),
          });

          console.log(
            `Saved expense: ${transaction.description} (${transaction.category}, €${transaction.amount})`
          );
        } else if (transaction.type === "income" && transaction.source) {
          // Save income to database
          // Uncomment this when you're ready to save to the database

          await IncomeService.addIncome(
            [],
            {
              amount: transaction.amount,
              description: {
                info: transaction.description,
              },
              user: new mongoose.Types.ObjectId(userId),
              source: transaction.source,
              method: "card",
            },
            userId
          );

          console.log(
            `Saved income: ${transaction.description} (${transaction.source}, €${transaction.amount})`
          );
        }
      }
    } catch (error) {
      console.error(
        `Error processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  console.log("Transaction processing complete");
};

// Optional: Add a simple caching mechanism to avoid reclassifying identical transactions
export class TransactionClassifier {
  private cache: Map<string, any> = new Map();

  async classify(transactions: ITransaction[]): Promise<any[]> {
    // Filter out transactions that are already in cache
    const uncachedTransactions = transactions.filter(
      (t) => !this.cache.has(this.getCacheKey(t))
    );

    let classifiedUncached: any[] = [];
    if (uncachedTransactions.length > 0) {
      // Only call API if there are uncached transactions
      classifiedUncached = await batchClassifyTransactions(
        uncachedTransactions
      );

      // Update cache with new classifications
      classifiedUncached.forEach((ct) => {
        const originalTx = uncachedTransactions.find((t) => t.id === ct.id);
        if (originalTx) {
          this.cache.set(this.getCacheKey(originalTx), ct);
        }
      });
    }

    // Combine cached and newly classified results
    return transactions.map((t) => {
      const cacheKey = this.getCacheKey(t);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      } else {
        // This should not happen if classifiedUncached contains all uncached transactions
        const amount = convertAmount(t.amount);
        const description = t.descriptions.display;
        const type =
          parseInt(t.amount.value.unscaledValue) > 0 ? "income" : "expense";

        return {
          id: t.id,
          type,
          amount,
          description,
          ...(type === "expense" ? { category: "other" } : {}),
          ...(type === "income" ? { source: "other" } : {}),
        };
      }
    });
  }

  private getCacheKey(transaction: ITransaction): string {
    // Create a unique key based on description and amount
    return `${transaction.descriptions.display}:${transaction.amount.value.unscaledValue}`;
  }
}
