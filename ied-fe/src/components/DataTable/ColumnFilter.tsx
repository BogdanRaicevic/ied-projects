import { MenuItem, Select } from "@mui/material";
import type { Column, RowData } from "@tanstack/react-table";
import DebouncedTextField from "./DebouncedTextField";
import type { DataTableFeatures } from "./features";

export default function ColumnFilter<T extends RowData>({
  column,
}: {
  column: Column<DataTableFeatures, T>;
}) {
  const options = column.columnDef.meta?.filterOptions;
  const header = column.columnDef.header;
  const label = `Filter: ${typeof header === "string" ? header : column.id}`;

  if (options) {
    return (
      <Select
        autoFocus
        displayEmpty
        fullWidth
        size="small"
        variant="standard"
        value={(column.getFilterValue() as string | undefined) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        inputProps={{ "aria-label": label }}
      >
        <MenuItem value="">Svi</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <DebouncedTextField
      autoFocus
      fullWidth
      size="small"
      variant="standard"
      placeholder="Filter…"
      onDebouncedChange={(value) => column.setFilterValue(value || undefined)}
      slotProps={{ htmlInput: { "aria-label": label } }}
    />
  );
}
