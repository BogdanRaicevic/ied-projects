import { Box, Dialog, DialogContent } from "@mui/material";
import { format } from "date-fns";
import type { SeminarQueryParams, SeminarZodType } from "ied-shared";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";
import { useCallback, useMemo, useState } from "react";
import { useSearchSeminari } from "../../hooks/seminar/useSeminarQueries";
import { useTopScrollbar } from "../../hooks/useTopScrollbar";
import SeminarForm from "./SeminarForm";
import SeminariTableActionCell from "./SeminariTableActionCell";
import SeminarSubTable from "./SeminarSubTable";

export default function SeminariTable({
  queryParameters,
}: {
  queryParameters: SeminarQueryParams;
}) {
  const [editSeminar, setEditSeminar] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<
    Partial<SeminarZodType>
  >({});

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const { data: seminars, isLoading } = useSearchSeminari({
    pageSize: pagination.pageSize,
    pageIndex: pagination.pageIndex,
    queryParameters,
  });

  const scrollbarProps = useTopScrollbar<SeminarZodType>();

  const data = seminars?.seminari || [];
  const documents = seminars?.totalDocuments || 0;

  const handleEditSeminar = (seminar: any) => {
    setSelectedSeminar(seminar);
    setEditSeminar(true);
  };

  const seminariTableColumns: MRT_ColumnDef<SeminarZodType>[] = [
    {
      header: "R. BR.",
      accessorKey: "rowNumber",
      size: 20,
      enableSorting: false,
      enableColumnActions: false,
      enableColumnFilter: false,
      enableColumnOrdering: false,
      enableHiding: false,

      Cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return pageIndex * pageSize + row.index + 1;
      },
    },
    {
      id: "actions",
      header: "Akcije",
      size: 100,
      Cell: ({ row }) => (
        <SeminariTableActionCell
          seminar={row.original}
          onEdit={handleEditSeminar}
        />
      ),
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

  const columns = useMemo<MRT_ColumnDef<SeminarZodType>[]>(
    () => seminariTableColumns,
    [],
  );

  const renderDetailPanel = useCallback(
    ({ row }: { row: MRT_Row<SeminarZodType> }) => (
      <Box sx={{ padding: "16px" }}>
        <SeminarSubTable row={row} />
      </Box>
    ),
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
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
      isLoading,
      showProgressBars: isLoading,
    },
    rowCount: documents,
    enableExpanding: true,
    renderDetailPanel,
    ...scrollbarProps,
  });

  const handleSubmitSuccess = () => {
    setEditSeminar(false);
  };

  return (
    <>
      <MaterialReactTable table={table} />
      <Dialog
        open={editSeminar}
        onClose={() => setEditSeminar(false)}
        maxWidth="lg"
      >
        <DialogContent>
          <SeminarForm
            onDialogClose={handleSubmitSuccess}
            seminar={selectedSeminar}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
