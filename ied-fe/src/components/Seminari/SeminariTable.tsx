import { useEffect, useMemo, useState, memo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_PaginationState,
} from "material-react-table";
import { deleteSeminar, fetchSeminari } from "../../api/seminari.api";
import type { SeminarQueryParamsZodType, SeminarZodType } from "@ied-shared/types/seminar.zod";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrijaveSeminarTable from "./PrijaveSeminarTable";
import SeminarForm from "./SeminarForm";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import TableViewIcon from "@mui/icons-material/TableView";
import { format } from "date-fns";

export default memo(function SeminariTable(props: {
  queryParameters: SeminarQueryParamsZodType;
  updateCounter: number;
}) {
  const [data, setData] = useState<SeminarZodType[]>([]);
  const [documents, setDocuments] = useState(1000);
  const [deletePrijavaCounter, setDeletePrijavaCounter] = useState(0);
  const [seminarChangesCounter, setSeminarChangesCount] = useState(0);
  const [editSeminar, setEditSeminar] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<Partial<SeminarZodType>>({});

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const res = await fetchSeminari(pageSize, pageIndex, props.queryParameters);
      setData(res.seminari);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination, props, deletePrijavaCounter, seminarChangesCounter, props.updateCounter]);

  const handleDelete = async (id: string) => {
    await deleteSeminar(id);
    setSeminarChangesCount((prev) => prev + 1);
  };

  const handleEditSeminar = (seminar: any) => {
    setSelectedSeminar(seminar);
    setEditSeminar(true);
  };

  const handleExportUcesnikaSeminara = (seminar: Partial<SeminarZodType>) => {
    let csv = "Redni Broj, Naziv firme, Ime i Prezime, Email\n";
    const data = seminar.prijave
      ?.map(
        (p, index) =>
          `${index + 1},${p.firma_naziv},${p.zaposleni_ime} ${p.zaposleni_prezime},${p.zaposleni_email}`
      )
      .join("\n");

    csv += data;
    exportDataToCSV(seminar, "klijenti", csv);
  };

  const handleExportSeminarTable = (seminar: Partial<SeminarZodType>) => {
    const csvRows: string =
      `${seminar.naziv}\n` +
      "Redni Broj, Naziv firme, Ime i Prezime, Email\n" +
      seminar.prijave
        ?.map((p, index) => {
          return `${index + 1}, ${p.firma_naziv},${p.zaposleni_ime} ${p.zaposleni_prezime},${p.zaposleni_email}`;
        })
        .join("\n");

    exportDataToCSV(seminar, "seminar", csvRows);
  };

  const exportDataToCSV = async (
    seminar: Partial<SeminarZodType>,
    exportSubject: "seminar" | "klijenti",
    csvData: string
  ) => {
    try {
      // Prepend BOM for Excel to recognize UTF-8 encoding of special Serbian characters
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${seminar.naziv}-${exportSubject}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // TODO: show error snackbar or toast
      console.error("Error exporting data:", error);
    }
  };

  const seminariTableColumns: MRT_ColumnDef<SeminarZodType>[] = [
    {
      id: "actions",
      header: "Akcije",
      size: 100,
      Cell: ({ row }) => {
        const seminar: Partial<SeminarZodType> = row.original;
        return (
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip title="Edit">
              <IconButton
                color="info"
                onClick={() => {
                  if (seminar._id) {
                    handleEditSeminar(seminar);
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export učesnika">
              <IconButton
                color="secondary"
                onClick={() => {
                  if (seminar._id) {
                    handleExportUcesnikaSeminara(seminar);
                  }
                }}
              >
                <ForwardToInboxIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export tabele">
              <IconButton
                color="secondary"
                onClick={() => {
                  if (seminar._id) {
                    handleExportSeminarTable(seminar);
                  }
                }}
              >
                <TableViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  if (window.confirm("Da li ste sigurni da želite da obrišete seminar?")) {
                    if (seminar._id) {
                      handleDelete(seminar._id);
                      setSeminarChangesCount((prev) => prev + 1);
                    }
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      header: "Naziv Seminara",
      accessorKey: "naziv",
    },
    {
      header: "Predavač",
      accessorKey: "predavac",
    },
    {
      header: "Lokacija",
      accessorKey: "lokacija",
    },
    {
      header: "Datum",
      accessorKey: "datum",
      Cell: ({ cell }) => {
        const value = cell.getValue() as string | Date;
        if (!value) return null;
        return format(value, "yyyy-MM-dd");
      },
      sortingFn: "datetime",
    },
    {
      header: "Detalji",
      accessorKey: "detalji",
    },
    {
      header: "Broj Učesnika",
      accessorFn: (row) => row.prijave?.length || 0,
    },
  ];

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<SeminarZodType>[]>(() => seminariTableColumns, []),
    data: useMemo<SeminarZodType[]>(() => data, [data]),
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    onPaginationChange: setPagination,
    enablePagination: true,
    state: {
      pagination,
    },
    rowCount: documents,
    enableExpanding: true,
    renderDetailPanel: (row) => {
      const participants = row.row.original.prijave;

      const groupedParticipants = participants.reduce(
        (acc, curr) => {
          const key = curr.firma_naziv;
          if (!key) {
            return acc;
          }

          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(curr);
          return acc;
        },
        {} as Record<string, typeof participants>
      );

      return (
        participants.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& > *": { borderBottom: "unset" },
                    backgroundColor: "#95bb9f",
                  }}
                >
                  <TableCell />
                  <TableCell>Akcije</TableCell>
                  <TableCell>Naziv Firme</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>Broj Prijavljenih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedParticipants).map(([naziv_firme, prijave]) => {
                  return (
                    <PrijaveSeminarTable
                      key={naziv_firme}
                      seminarId={row.row.original._id || ""}
                      prijave={prijave}
                      onDelete={() => {
                        setDeletePrijavaCounter((prev) => prev + 1);
                      }}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      );
    },
  });

  const handleSubmitSuccess = () => {
    setEditSeminar(false);
    setSeminarChangesCount((prev) => prev + 1); // Triggers table refresh
  };

  return (
    <>
      <MaterialReactTable table={table} />
      <Dialog open={editSeminar} onClose={() => setEditSeminar(false)} maxWidth="lg">
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <SeminarForm onDialogClose={handleSubmitSuccess} seminar={selectedSeminar} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
});
