import z from "zod";

export const requiredNumber = (label: string) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce
      .number({
        error: `${label} is required`,
      })
      .min(0, `${label} cannot be negative`),
  );
