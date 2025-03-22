import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import Expense from "./expence.model";
import { IExpense } from "./expense.interface";

const addExpense = async (
  imageArray: Express.Multer.File[],
  expenseData: IExpense,
  userId: string
): Promise<IExpense> => {
  const images = [];
  for (let i = 0; i < imageArray.length; i++) {
    const path = getRelativePath(imageArray[i].path);
    images.push(path);
  }

  if (images.length !== 0) {
    expenseData.description.images = images;
  }

  const result = await Expense.create({ ...expenseData, user: userId });

  return result;
};

export const ExpenseService = {
  addExpense,
};
