import PushPinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, TableCell, TableSortLabel } from "@mui/material";
import { FlexRender, type Header, type RowData } from "@tanstack/react-table";
import { useState } from "react";
import ColumnFilter from "./ColumnFilter";
import { contentWidth, pinnedSx, widthSx } from "./columnSx";
import type { DataTableFeatures } from "./features";

export default function HeaderCell<T extends RowData>({
  header,
}: {
  header: Header<DataTableFeatures, T>;
}) {
  const column = header.column;
  // The filter is hidden until opened; closing it also clears it, so a hidden
  // filter never silently hides rows.
  const [filterOpen, setFilterOpen] = useState(false);
  const toggleFilter = () => {
    if (filterOpen) column.setFilterValue(undefined);
    setFilterOpen(!filterOpen);
  };

  return (
    <TableCell
      sx={{ fontWeight: 700, ...widthSx(column), ...pinnedSx(column) }}
    >
      <Box sx={{ maxWidth: contentWidth(column) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {column.getIsPinned() && (
            <PushPinIcon
              color="primary"
              sx={{ fontSize: 14, opacity: 0.7 }}
              titleAccess="Zakačena kolona"
            />
          )}
          {header.isPlaceholder ? null : column.getCanSort() ? (
            <TableSortLabel
              active={!!column.getIsSorted()}
              direction={column.getIsSorted() || "asc"}
              onClick={column.getToggleSortingHandler()}
              // MUI hides the icon until hover; keep it visible (sorted column is full opacity)
              sx={{ "& .MuiTableSortLabel-icon": { opacity: 0.4 } }}
            >
              <FlexRender header={header} />
            </TableSortLabel>
          ) : (
            <FlexRender header={header} />
          )}
          {column.getCanFilter() && (
            <IconButton
              size="small"
              sx={{ p: 0.25 }}
              color={filterOpen ? "primary" : "default"}
              aria-label={filterOpen ? "Sakrij filter" : "Prikaži filter"}
              onClick={toggleFilter}
            >
              <SearchIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
        {column.getCanFilter() && filterOpen && (
          <ColumnFilter column={column} />
        )}
      </Box>
    </TableCell>
  );
}
