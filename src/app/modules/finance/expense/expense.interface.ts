export interface IExpense {
  date: Date;
  amount: number;
  category: TCategory;
  method: TMethod;
  note?: string;
  description: {
    image: string;
    info: string;
  };
}
export const categories = [
  "Food",
  "Social Life",
  "Pets",
  "Education",
  "Gift",
  "Transport",
  "Rent",
  "Apparel",
  "Beauty",
  "Health",
  "Other",
] as const;

type TCategory = (typeof categories)[number];

export const method = ["cash", "card"] as const;
type TMethod = (typeof method)[number];
