import { useState, useEffect, useMemo } from "react";
import { searchRacuni } from "../../api/racuni.api";
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { Racun } from "@ied-shared/index";
import { Chip } from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import { formatDate } from "date-fns";

export const PretrageRacuna = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [racuniData, setRacuniData] = useState<any>(null);

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
      },
      {
        accessorKey: "tipRacuna",
        header: "Tip računa",
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
        header: "Izdavac racuna",
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
