import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Box, IconButton, Tooltip } from "@mui/material";
import { red } from "@mui/material/colors";
import type { ZaposleniType } from "ied-shared";
import { useMemo, useState } from "react";
import DataTable from "../DataTable/DataTable";
import { getZaposleniColumns } from "./zaposleniColumns";

type ZaposleniTableProps = {
  zaposleni: ZaposleniType[];
  onEdit: (zaposleni: ZaposleniType) => void;
  onDelete: (zaposleni: ZaposleniType) => void;
  onPrijaviNaSeminar: (zaposleni: ZaposleniType) => void;
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });

  const columns = useMemo(
    () =>
      getZaposleniColumns((zaposleni) => (
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
      )),
    [onEdit, onDelete, onPrijaviNaSeminar, isDeleting, deletingZaposleniId],
  );

  return (
    <DataTable
      columns={columns}
      data={zaposleni}
      pagination={pagination}
      onPaginationChange={setPagination}
      pinnedLeft={["rowNumber", "actions"]}
      getRowColor={(z) => (z.prijavljeni === false ? red[100] : undefined)}
    />
  );
};
