import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Box, IconButton, Tooltip } from "@mui/material";
import { red } from "@mui/material/colors";
import type { ZaposleniType } from "ied-shared";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { useTopScrollbar } from "../../hooks/useTopScrollbar";
import { zaposleniColumns } from "./zaposleniColumns";

type ZaposleniTableProps = {
  zaposleni: ZaposleniType[];
  onEdit: (row: MRT_Row<ZaposleniType>) => void;
  onDelete: (row: MRT_Row<ZaposleniType>) => void;
  onPrijaviNaSeminar: (row: MRT_Row<ZaposleniType>) => void;
  isDeleting: boolean;
  deletingZaposleniId?: string;
};

export const ZaposleniTable: React.FC<ZaposleniTableProps> = ({
  zaposleni,
  onEdit,
  onDelete,
  onPrijaviNaSeminar,
  isDeleting,
  deletingZaposleniId,
}) => {
  const scrollbarProps = useTopScrollbar<ZaposleniType>();

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<ZaposleniType>[]>(
      () => zaposleniColumns,
      [],
    ),
    data: zaposleni,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableEditing: true,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Prijavi na seminar" color="success">
          <IconButton onClick={() => onPrijaviNaSeminar(row)}>
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  "Da li ste sigurni da želite da obrišete zaposlenog?",
                )
              ) {
                onDelete(row);
              }
            }}
            disabled={isDeleting && deletingZaposleniId === row.original._id}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
      columnPinning: {
        left: ["rowNumber", "actions"],
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor:
          row.original.prijavljeni === false ? red[100] : "inherit",
      },
    }),
    ...scrollbarProps,
  });

  return <MaterialReactTable table={table} />;
};
