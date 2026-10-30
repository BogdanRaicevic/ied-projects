import { Box, Dialog, DialogContent } from "@mui/material";
import { format } from "date-fns";
import type { SeminarQueryParams, SeminarZodType } from "ied-shared";
import { useMemo, useState } from "react";
import { useSearchSeminari } from "../../hooks/seminar/useSeminarQueries";
import DataTable, { type DataTableColumn } from "../DataTable/DataTable";
import SeminarForm from "./SeminarForm";
import SeminariTableActionCell from "./SeminariTableActionCell";
import SeminarSubTable from "./SeminarSubTable";

const noSeminari: SeminarZodType[] = [];

export default function SeminariTable({
  queryParameters,
}: {
  queryParameters: SeminarQueryParams;
}) {
  const [editSeminar, setEditSeminar] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<SeminarZodType>();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const { data: seminars, isLoading } = useSearchSeminari({
    pageSize: pagination.pageSize,
    pageIndex: pagination.pageIndex,
    queryParameters,
  });

  const data = seminars?.seminari ?? noSeminari;
  const documents = seminars?.totalDocuments || 0;

  const handleEditSeminar = (seminar: any) => {
    setSelectedSeminar(seminar);
    setEditSeminar(true);
  };

  const seminariTableColumns: DataTableColumn<SeminarZodType>[] = [
    {
      header: "R. BR.",
      id: "rowNumber",
      size: 90,
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.atoms.pagination.get();
        return pageIndex * pageSize + row.index + 1;
      },
    },
    {
      id: "actions",
      header: "Akcije",
      size: 90,
      cell: ({ row }) => (
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
      id: "datumi",
      accessorFn: (row) =>
        (row.datumi ?? [])
          .map((date) => format(new Date(date), "yyyy-MM-dd"))
          .join(", "),
      cell: ({ row }) => {
        const datumi = row.original.datumi ?? [];

        if (datumi.length === 0) {
          return null;
        }

        return datumi.map((date) => (
          <div key={date.toString()}>
            {format(new Date(date), "yyyy-MM-dd")}
          </div>
        ));
      },
    },

    {
      header: "Broj Učesnika",
      accessorFn: (row) => row.prijave?.length || 0,
    },
  ];

  const columns = useMemo<DataTableColumn<SeminarZodType>[]>(
    () => seminariTableColumns,
    [],
  );

  const handleSubmitSuccess = () => {
    setEditSeminar(false);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={documents}
        renderDetailPanel={(seminar) => (
          <Box sx={{ padding: "16px" }}>
            <SeminarSubTable seminar={seminar} />
          </Box>
        )}
      />
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
