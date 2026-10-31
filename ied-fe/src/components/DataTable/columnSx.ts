import { alpha } from "@mui/material/styles";
import type { SystemStyleObject, Theme } from "@mui/system";
import type { Column, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "./features";

type DataTableColumnInstance<T extends RowData> = Column<DataTableFeatures, T>;

// A column with `size` is exactly that wide (pinned ones always are, so their
// sticky offsets match the layout). Other columns grow with their content.
const fixedWidth = <T extends RowData>(column: DataTableColumnInstance<T>) =>
  column.getIsPinned() ? column.getSize() : column.columnDef.size;

export const widthSx = <T extends RowData>(
  column: DataTableColumnInstance<T>,
) => {
  const width = fixedWidth(column);
  return width
    ? { width, minWidth: width }
    : { minWidth: column.columnDef.minSize };
};

// Content max width: fixed columns subtract the 16px + 16px cell padding.
export const contentWidth = <T extends RowData>(
  column: DataTableColumnInstance<T>,
) => {
  const width = fixedWidth(column);
  return width ? width - 32 : 500;
};

export const pinnedSx = <T extends RowData>(
  column: DataTableColumnInstance<T>,
): SystemStyleObject<Theme> =>
  column.getIsPinned()
    ? {
        position: "sticky",
        left: column.getStart("start"),
        zIndex: 1,
        bgcolor: "inherit",
        // Light tint on top of the row colour, so pinned columns stand out.
        backgroundImage: (theme) => {
          const tint = alpha(theme.palette.primary.main, 0.06);
          return `linear-gradient(${tint}, ${tint})`;
        },
      }
    : {};
