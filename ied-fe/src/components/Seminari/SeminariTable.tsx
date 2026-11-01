import { Box, Dialog, DialogContent } from "@mui/material";
import type { SeminarQueryParams, SeminarZodType } from "ied-shared";
import { useCallback, useMemo, useState } from "react";
import { useSearchSeminari } from "../../hooks/seminar/useSeminarQueries";
import DataTable from "../DataTable/DataTable";
import SeminarForm from "./SeminarForm";
import SeminarSubTable from "./SeminarSubTable";
import { getSeminariColumns } from "./seminariColumns";

// Stable reference: a new [] each render makes TanStack Table rebuild rows and reset expanded state.
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

  const handleEditSeminar = useCallback((seminar: SeminarZodType) => {
    setSelectedSeminar(seminar);
    setEditSeminar(true);
  }, []);

  const columns = useMemo(
    () => getSeminariColumns(handleEditSeminar),
    [handleEditSeminar],
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
