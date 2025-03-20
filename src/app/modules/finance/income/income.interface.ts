export interface IIncome {
  date: Date;
  amount: number;
  source: TSource;
  method: TMethod;
  note?: string;
  description: {
    image: string;
    info: string;
  };
}

export const source = ["salary", "petty cash", "bonus", "other"] as const;
type TSource = (typeof source)[number];

export const method = ["cash", "card"] as const;
type TMethod = (typeof method)[number];
