/* eslint-disable @typescript-eslint/no-unused-vars */
export const removeFalsyFields = <T extends Record<string, unknown>>(
  obj: T,
  withZero: boolean = false
): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      if (withZero) {
        return Boolean(value);
      }
      return Boolean(value) || value === 0;
    })
  ) as Partial<T>;
