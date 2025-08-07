import type { AuditLogType } from "@ied-shared/types/audit_log.zod"; // Adjust the import path as necessary
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { AuditChangesViewer } from "../components/AuditChangesViewer/AuditChangesViewer";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { generateStructuredDiff } from "../utils/diffGenerator";

export default function AuditLog() {
  const { data, isLoading } = useAuditLogs();

  const {
    data: auditLogs,
    totalDocuments,
    totalPages,
  } = data || { auditLogs: [], totalDocuments: 0, totalPages: 0 };

  const auditLogsColumns = useMemo<MRT_ColumnDef<AuditLogType>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
      },
      {
        accessorKey: "userEmail",
        header: "Korisnik",
      },
      {
        accessorKey: "resource.model",
        header: "Tip resursa",
      },

      {
        header: "Promene",
        minSize: 500,
        Cell: ({ row }) => {
          const { before, after } = row.original;

          const changes = useMemo(() => generateStructuredDiff(before, after), [before, after]);

          if (!changes) {
            return null;
          }

          return <AuditChangesViewer changes={changes} />;
        },
      },
    ],
    [],
  );

  const auditLogsTable = useMaterialReactTable({
    columns: auditLogsColumns,
    data: auditLogs || [],
    state: {
      isLoading,
    },
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
  });

  return (
    <div>
      <h1>Evidencija Promena</h1>

      <MaterialReactTable table={auditLogsTable} />
    </div>
  );
}
