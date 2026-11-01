import { z } from "zod";

// JSON and query strings carry dates as strings; date pickers hold a Date, or
// null when cleared. z.coerce.date() alone turns null into 1970-01-01 and
// passes, so null and "" are treated as "no value" before coercing.
const emptyToUndefined = (value: Date | string | null | undefined) =>
  value === null || value === "" ? undefined : value;

export const zDate = (message?: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.date<Date | string | undefined>(message),
  );

export const zOptionalDate = () =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.date<Date | string | undefined>().optional(),
  );
