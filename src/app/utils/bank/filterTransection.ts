import { IBankTransaction } from "../../modules/bank/tink/tink.interface";
import Expense from "../../modules/finance/expense/expense.model";
import Income from "../../modules/finance/income/income.model";
import { Savings } from "../../modules/finance/savings/savings.model";

export const filterTransection = async (
  transactions: IBankTransaction[]
): Promise<IBankTransaction[]> => {
  const newTransactions: IBankTransaction[] = [];
  for (const tx of transactions) {
    const [existingExpense, existingIncome, existingSavings] =
      await Promise.all([
        Expense.findOne({ tId: tx.id }),
        Income.findOne({ tId: tx.id }),
        Savings.findOne({ tId: tx.id }),
      ]);

    if (!existingExpense && !existingIncome && !existingSavings) {
      newTransactions.push(tx);
    }
  }
  return newTransactions;
};
