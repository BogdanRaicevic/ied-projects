import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Box, colors, IconButton, Tooltip } from "@mui/material";
import { ZaposleniSchema, type ZaposleniType } from "ied-shared";
import type { DataTableColumn } from "../DataTable/DataTable";

export type ZaposleniActions = {
  onEdit: (zaposleni: ZaposleniType) => void;
  onDelete: (zaposleni: ZaposleniType) => void;
  onPrijaviNaSeminar: (zaposleni: ZaposleniType) => void;
  isDeleting: boolean;
  deletingZaposleniId?: string;
};

export const getZaposleniColumns = ({
  onEdit,
  onDelete,
  onPrijaviNaSeminar,
  isDeleting,
  deletingZaposleniId,
}: ZaposleniActions): DataTableColumn<ZaposleniType>[] => [
  {
    header: "Akcije",
    id: "actions",
    size: 190,
    cell: ({ row }) => {
      const zaposleni = row.original;
      return (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Tooltip title="Prijavi na seminar" color="success">
            <IconButton onClick={() => onPrijaviNaSeminar(zaposleni)}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(zaposleni)}>
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
                  onDelete(zaposleni);
                }
              }}
              disabled={isDeleting && deletingZaposleniId === zaposleni._id}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
  {
    header: "Ime i Prezime",
    accessorFn: (row) => `${row.ime} ${row.prezime}`,
  },
  {
    header: "Email",
    accessorKey: "e_mail",
    meta: {
      copy: true,
      cellSx: (email) =>
        ZaposleniSchema.shape.e_mail.safeParse(email).success
          ? {}
          : { bgcolor: colors.red[100] },
    },
  },
  {
    header: "Telefon",
    accessorKey: "telefon",
  },
  {
    header: "Radna mesta",
    accessorKey: "radno_mesto",
  },
  {
    header: "Komentari",
    accessorKey: "komentar",
    minSize: 400,
    meta: {
      cellSx: () => ({ whiteSpace: "pre-wrap" }), // Preserve line breaks and whitespace
    },
  },
];
