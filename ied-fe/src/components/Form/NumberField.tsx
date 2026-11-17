import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  type SxProps,
  type Theme,
} from "@mui/material";
import { type FocusEvent, type ReactNode, type Ref, useId } from "react";

// Without grouping, sr-RS parses both "12,5" and "12.5" as 12.5. With grouping
// on, "." is the thousands separator and "12.5" would silently become 125.
const FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumFractionDigits: 2,
};

type NumberFieldProps = {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  name?: string;
  ref?: Ref<HTMLDivElement>;
  disabled?: boolean;
  required?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  min?: number;
  max?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

/**
 * Base UI NumberField styled as an outlined MUI field, for RHF `Controller`s
 * (`<NumberField {...field} />`). Keeps `number | null` in form state (empty →
 * null, so the schema rejects it instead of coercing to 0) and selects the
 * value on focus so typing replaces it instead of producing "0123".
 * Based on https://mui.com/material-ui/react-number-field/
 */
export function NumberField({
  value,
  onChange,
  onBlur,
  name,
  ref,
  disabled,
  required,
  label,
  helperText,
  error,
  fullWidth,
  sx,
  min,
  max,
  startAdornment,
  endAdornment,
}: NumberFieldProps) {
  const id = useId();
  const helperTextId = `${id}-helper-text`;

  return (
    <BaseNumberField.Root
      ref={ref}
      value={value ?? null}
      onValueChange={(next) => onChange(next)}
      name={name}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      locale="sr-RS"
      format={FORMAT}
      render={(props, state) => (
        <FormControl
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          fullWidth={fullWidth}
          sx={sx}
        >
          {props.children}
        </FormControl>
      )}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <OutlinedInput
            label={label}
            inputRef={props.ref}
            value={state.inputValue}
            // As in the MUI docs: InputBase replaces onChange/onFocus/onBlur from
            // slotProps.input with its own, which only call these top-level ones.
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              props.onBlur?.(e);
              onBlur?.();
            }}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              props.onFocus?.(e);
              e.target.select();
            }}
            slotProps={{ input: props }}
            aria-describedby={helperText ? helperTextId : undefined}
            startAdornment={
              startAdornment ? (
                <InputAdornment position="start">
                  {startAdornment}
                </InputAdornment>
              ) : undefined
            }
            endAdornment={
              endAdornment ? (
                <InputAdornment position="end">{endAdornment}</InputAdornment>
              ) : undefined
            }
          />
        )}
      />
      {helperText ? (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      ) : null}
    </BaseNumberField.Root>
  );
}
