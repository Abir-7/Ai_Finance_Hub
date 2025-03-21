import { getRelativePath } from "../../../utils/helper/getRelativeFilePath";
import { IIncome } from "./income.interface";
import Income from "./income.model";

const addIncome = async (
  imageArray: Express.Multer.File[],
  incomeData: IIncome,
  userId: string
): Promise<IIncome> => {
  const images = [];
  for (let i = 0; i < imageArray.length; i++) {
    const path = getRelativePath(imageArray[i].path);
    images.push(path);
  }

  if (images.length !== 0) {
    incomeData.description.images = images;
  }

  const result = await Income.create({ ...incomeData, user: userId });

  return result;
};

export const IncomeService = {
  addIncome,
};
