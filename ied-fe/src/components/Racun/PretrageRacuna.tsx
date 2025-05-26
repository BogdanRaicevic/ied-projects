import { useState, useEffect, useMemo } from "react";
import { searchRacuni } from "../../api/racuni.api";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  useMaterialReactTable,
} from "material-react-table";
import { PretrageRacunaZodType, RacunZod } from "@ied-shared/index";
import {
  Link,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  IconButton,
} from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ParametriPretrageRacuna } from "./ParametriPretrageRacuna";

type SearchState = {
  filterValues: PretrageRacunaZodType;
  pagination: MRT_PaginationState;
};

export const PretrageRacuna = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [racuniData, setRacuniData] = useState<{
    totalDocuments: number;
    totalPages: number;
    racuni: RacunZod[];
  }>();

  const racuniColumns = useMemo<MRT_ColumnDef<RacunZod>[]>(
    () => [
      {
        accessorKey: "pozivNaBroj",
        header: "Poziv na broj",
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const navigate = useNavigate();

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
                      selectedTipRacuna: cell.row.original.tipRacuna,
                      selectedPozivNaBroj: value,
                      selectedRacunId: cell.row.original._id,
                    },
                  });
                }}
              >
                {value}
              </Link>
              <Tooltip title="Kopiraj poziv na broj" arrow>
                <IconButton sx={{ marginLeft: 1 }} size="small" onClick={handleCopyClick}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
      {
        accessorKey: "tipRacuna",
        header: "Tip računa",
        Header: ({ column }) => <TipRacunaFilterHeader column={column} />,
        filterVariant: "select",
        enableColumnFilter: false, // Disable standard filter as we're using custom header
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const rowValue = row.getValue(id) as string;
          return rowValue === filterValue;
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          let color: string;
          let label: string = value;

          switch (value) {
            case "konacniRacun":
              color = blue[200];
              label = "Konačni";
              break;
            case "avansniRacun":
              color = green[200];
              label = "Avansni";
              break;
            case "predracun":
              color = red[300];
              label = "Predračun";
              break;
            default:
              color = "default";
          }

          return <Chip label={label} sx={{ backgroundColor: color, color: "#fff" }} size="small" />;
        },
      },
      {
        accessorKey: "dateCreatedAt",
        header: "Datum kreiranja racuna",
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue<string>());
          return formatDate(date, "dd.MM.yyyy"); // Format the date as needed
        },
      },
      {
        accessorKey: "izdavacRacuna",
        header: "Izdavač računa",
        Header: ({ column }) => <IzdavacFilterHeader column={column} />,
        filterVariant: "select",
        enableColumnFilter: false,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const rowValue = row.getValue(id) as string;
          return rowValue?.toLowerCase() === filterValue.toLowerCase();
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          let color: string;
          let label: string = value;

          switch (value?.toLowerCase()) {
            case "ied":
              color = blue[500];
              label = "IED";
              break;
            case "bs":
              color = green[500];
              label = "BS";
              break;
            case "permanent":
              color = purple[500];
              label = "Permanent";
              break;
            default:
              color = "default";
          }

          return <Chip label={label} sx={{ backgroundColor: color, color: "#fff" }} size="small" />;
        },
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
        filterVariant: "text",
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ row }) => {
          const naziv = row.original.seminar?.naziv ?? "";
          const datum = row.original.seminar?.datum
            ? formatDate(new Date(row.original.seminar.datum), "yyyy.MM.dd")
            : "";

          if (!naziv) return "-";

          return (
            <div>
              <div style={{ fontWeight: "bold" }}>{naziv}</div>
              {datum && <div style={{ fontSize: "0.85rem", color: "#666" }}>{datum}</div>}
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
    ],
    []
  );

  const [searchState, setSearchState] = useState<SearchState>({
    filterValues: {},
    pagination: {
      pageIndex: 0,
      pageSize: 20,
    },
  });

  const handleSearch = (newFilters: PretrageRacunaZodType) => {
    setSearchState((prev) => ({
      filterValues: newFilters,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  };

  const racuniTable = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<RacunZod>[]>(() => racuniColumns, [racuniColumns]),
    data: useMemo<RacunZod[]>(() => racuniData?.racuni || [], [racuniData?.racuni]),
    enableFilters: true,
    enableColumnFilters: true,
    enableSorting: true,
    muiSearchTextFieldProps: {
      variant: "outlined",
      placeholder: "Pretraži...",
      size: "small",
      sx: { minWidth: "300px" },
    },
    state: {
      isLoading: loading,
      pagination: searchState.pagination,
    },
    rowCount: racuniData?.totalDocuments || 0,
    manualPagination: true,
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50, 100],
    },
    enablePagination: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    onPaginationChange: (updater) => {
      setSearchState((prev) => ({
        ...prev,
        pagination: typeof updater === "function" ? updater(prev.pagination) : updater,
      }));
    },
  });

  useEffect(() => {
    const fetchRacuni = async () => {
      try {
        setLoading(true);
        const data = await searchRacuni(
          searchState.pagination.pageIndex,
          searchState.pagination.pageSize,
          searchState.filterValues
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
      <MaterialReactTable table={racuniTable} />
    </div>
  );
};

const IzdavacFilterHeader = ({ column }: { column: any }) => {
  const [value, setValue] = useState<string>("");

  const handleChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setValue(selectedValue);
    column.setFilterValue(selectedValue || undefined);
  };

  return (
    <Box>
      <Box mb={1}>Izdavač računa</Box>
      <FormControl fullWidth size="small">
        <Select value={value} onChange={handleChange} displayEmpty variant="outlined">
          <MenuItem value="">Svi izdavači</MenuItem>
          <MenuItem value="ied">
            <Chip label="IED" size="small" sx={{ backgroundColor: blue[500], color: "#fff" }} />
          </MenuItem>
          <MenuItem value="bs">
            <Chip label="BS" size="small" sx={{ backgroundColor: green[500], color: "#fff" }} />
          </MenuItem>
          <MenuItem value="permanent">
            <Chip
              label="Permanent"
              size="small"
              sx={{ backgroundColor: purple[500], color: "#fff" }}
            />
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const TipRacunaFilterHeader = ({ column }: { column: any }) => {
  const [value, setValue] = useState<string>("");

  const handleChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setValue(selectedValue);
    column.setFilterValue(selectedValue || undefined);
  };

  return (
    <Box>
      <Box mb={1}>Tip računa</Box>
      <FormControl fullWidth size="small">
        <Select value={value} onChange={handleChange} displayEmpty variant="outlined">
          <MenuItem value="">Svi tipovi</MenuItem>
          <MenuItem value="konacniRacun">
            <Chip label="Konačni" size="small" sx={{ backgroundColor: blue[200], color: "#fff" }} />
          </MenuItem>
          <MenuItem value="avansniRacun">
            <Chip
              label="Avansni"
              size="small"
              sx={{ backgroundColor: green[200], color: "#fff" }}
            />
          </MenuItem>
          <MenuItem value="predracun">
            <Chip
              label="Predračun"
              size="small"
              sx={{ backgroundColor: red[300], color: "#fff" }}
            />
          </MenuItem>
          <MenuItem value="racun">
            <Chip label="Račun" size="small" />
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
