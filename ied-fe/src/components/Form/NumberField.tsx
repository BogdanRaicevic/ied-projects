import { TextField, type TextFieldProps } from "@mui/material";

type NumberFieldProps = Omit<TextFieldProps, "type" | "value" | "onChange"> & {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
};

/**
 * Number input for RHF `Controller`s: keeps `number | null` in form state
 * (empty → null, so the schema can reject it instead of coercing to 0) and
 * selects the value on focus so typing replaces it instead of producing "0123".
 */
export function NumberField({ value, onChange, ...props }: NumberFieldProps) {
  return (
    <TextField
      {...props}
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      onFocus={(e) => e.target.select()}
    />
  );
}
