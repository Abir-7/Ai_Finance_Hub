export const sumNumericValues = (obj: Record<string, unknown>): number =>
  Object.values(obj).reduce<number>(
    (sum: number, value) => sum + (typeof value === "number" ? value : 0),
    0
  );
