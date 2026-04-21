/**
 * Coerces RHF's loose form value (z.input for z.coerce.date is `unknown`)
 * into the `Date | null` shape MUI DatePicker expects. Strings (e.g. from
 * navigation prefill in Story 7.2) get parsed; invalid -> null.
 */
export const toDateOrNull = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" && value !== "") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};
