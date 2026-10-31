import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Link, Tooltip } from "@mui/material";
import { formatDate } from "date-fns";
import {
  IZDAVAC_RACUNA_LABELS,
  type RacunType,
  TIP_RACUNA_LABELS,
} from "ied-shared";
import { useNavigate } from "react-router-dom";
import type { DataTableColumn } from "../DataTable/DataTable";
import { IzdavacRacunaChip, TipRacunaChip } from "./RacunChips";

const PozivNaBrojCell = ({ racun }: { racun: RacunType }) => {
  const navigate = useNavigate();
  const value = racun.pozivNaBroj ?? "";

  const handleCopyClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation
    navigator.clipboard.writeText(value);
  };

  return (
    <Box>
      <Link
        sx={{ cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          navigate("", {
            state: {
              selectedTipRacuna: racun.tipRacuna,
              selectedPozivNaBroj: value,
              selectedRacunId: racun._id,
            },
          });
        }}
      >
        {value}
      </Link>
      <Tooltip title="Kopiraj poziv na broj" arrow>
        <IconButton
          sx={{ marginLeft: 1 }}
          size="small"
          onClick={handleCopyClick}
        >
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const racuniColumns: DataTableColumn<RacunType>[] = [
  {
    accessorKey: "pozivNaBroj",
    header: "Poziv na broj",
    cell: ({ row }) => <PozivNaBrojCell racun={row.original} />,
  },
  {
    accessorKey: "tipRacuna",
    header: "Tip računa",
    filterFn: "equalsString",
    meta: {
      filterOptions: Object.entries(TIP_RACUNA_LABELS).map(
        ([value, label]) => ({ value, label }),
      ),
    },
    cell: ({ getValue }) => <TipRacunaChip tip={getValue<string>()} />,
  },
  {
    accessorKey: "created_at",
    header: "Datum kreiranja racuna",
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return formatDate(date, "dd.MM.yyyy"); // Format the date as needed
    },
  },
  {
    accessorKey: "izdavacRacuna",
    header: "Izdavač računa",
    filterFn: "equalsString",
    meta: {
      filterOptions: Object.entries(IZDAVAC_RACUNA_LABELS).map(
        ([value, label]) => ({ value, label }),
      ),
    },
    cell: ({ getValue }) => <IzdavacRacunaChip izdavac={getValue<string>()} />,
  },
  {
    accessorFn: (row) => {
      const naziv = row.seminar?.naziv ?? "";
      const datum = row.seminar?.datum
        ? formatDate(new Date(row.seminar.datum), "yyyy.MM.dd")
        : "";
      return `${naziv} ${datum}`;
    },
    id: "seminarInfo",
    header: "Seminar",
    cell: ({ row }) => {
      const naziv = row.original.seminar?.naziv ?? "";
      const datum = row.original.seminar?.datum
        ? formatDate(new Date(row.original.seminar.datum), "yyyy.MM.dd")
        : "";

      if (!naziv) return "-";

      return (
        <div>
          <div style={{ fontWeight: "bold" }}>{naziv}</div>
          {datum && (
            <div style={{ fontSize: "0.85rem", color: "#666" }}>{datum}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "primalacRacuna.naziv",
    header: "Primalac racuna",
  },
  {
    accessorKey: "primalacRacuna.pib",
    header: "PIB primaoca",
  },
];
