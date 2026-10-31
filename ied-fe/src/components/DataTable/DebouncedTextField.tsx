import { TextField, type TextFieldProps } from "@mui/material";
import { useEffect, useRef } from "react";

// Uncontrolled input that reports its value once typing pauses, so the table
// doesn't re-filter on every keystroke.
export default function DebouncedTextField({
  onDebouncedChange,
  ...props
}: TextFieldProps & { onDebouncedChange: (value: string) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A pending update must not fire after unmount (closing a column filter clears it).
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <TextField
      {...props}
      onChange={(e) => {
        const value = e.target.value;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onDebouncedChange(value), 300);
      }}
    />
  );
}
