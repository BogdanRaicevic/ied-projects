import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Link, Tooltip } from "@mui/material";
import type { PaginationState } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  IZDAVAC_RACUNA_LABELS,
  type PretrageRacunaType,
  type RacunType,
  TIP_RACUNA_LABELS,
} from "ied-shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchRacuni } from "../../api/racuni.api";
import DataTable, { type DataTableColumn } from "../DataTable/DataTable";
import { ParametriPretrageRacuna } from "./ParametriPretrageRacuna";
import { IzdavacRacunaChip, TipRacunaChip } from "./RacunChips";

type SearchState = {
  filterValues: PretrageRacunaType;
  pagination: PaginationState;
};

const noRacuni: RacunType[] = [];

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

const racuniColumns: DataTableColumn<RacunType>[] = [
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

export const PretrageRacuna = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [racuniData, setRacuniData] = useState<{
    totalDocuments: number;
    totalPages: number;
    racuni: RacunType[];
  }>();

  const [searchState, setSearchState] = useState<SearchState>({
    filterValues: {},
    pagination: {
      pageIndex: 0,
      pageSize: 20,
    },
  });

  const handleSearch = (newFilters: PretrageRacunaType) => {
    setSearchState((prev) => ({
      filterValues: newFilters,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  };

  useEffect(() => {
    const fetchRacuni = async () => {
      try {
        setLoading(true);
        const data = await searchRacuni(
          searchState.pagination.pageIndex,
          searchState.pagination.pageSize,
          searchState.filterValues,
        );
        setRacuniData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRacuni();
  }, [searchState]);

  return (
    <div>
      <h1>Pretrage Racuna</h1>
      <ParametriPretrageRacuna onSearch={handleSearch} />
      <DataTable
        columns={racuniColumns}
        data={racuniData?.racuni ?? noRacuni}
        isLoading={loading}
        pagination={searchState.pagination}
        onPaginationChange={(pagination) =>
          setSearchState((prev) => ({ ...prev, pagination }))
        }
        rowCount={racuniData?.totalDocuments || 0}
      />
    </div>
  );
};
