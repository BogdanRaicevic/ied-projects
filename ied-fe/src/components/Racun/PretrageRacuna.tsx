import { useState, useEffect, useMemo } from "react";
import { searchRacuni } from "../../api/racuni.api";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { Racun } from "@ied-shared/index";
import { Link, Box, Chip, FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router-dom";

export const PretrageRacuna = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [racuniData, setRacuniData] = useState<{
    totalDocuments: number;
    totalPages: number;
    racuni: Racun[];
  }>();

  useEffect(() => {
    const fetchRacuni = async () => {
      try {
        setLoading(true);
        const data = await searchRacuni({ pageIndex: 1, pageSize: 50 });
        setRacuniData(data);
      } catch (err) {
        setError("Greška prilikom učitavanja računa");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRacuni();
  }, []);

  const racuniColumns = useMemo<MRT_ColumnDef<Racun>[]>(
    () => [
      {
        accessorKey: "pozivNaBroj",
        header: "Poziv na broj",
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const navigate = useNavigate();

          return (
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate("", {
                  state: {
                    selectedTab: cell.row.original.tipRacuna,
                    selectedPozivNaBroj: value,
                    selectedRacunId: cell.row.original._id,
                  },
                });
              }}
            >
              {value}
            </Link>
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

  const racuniTable = useMaterialReactTable({
    columns: racuniColumns,
    data: racuniData?.racuni || [],
    enableFilters: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,

    // These props improve the search/filter UX
    muiSearchTextFieldProps: {
      variant: "outlined",
      placeholder: "Pretraži...",
      size: "small",
      sx: { minWidth: "300px" },
    },
    // Show loading state
    state: {
      isLoading: loading,
    },
  });

  return (
    <div>
      <h1>Pretrage Racuna</h1>
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
        </Select>
      </FormControl>
    </Box>
  );
};
