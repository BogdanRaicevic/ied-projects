import type { AuditLogType } from "@ied-shared/types/audit_log.zod"; // Adjust the import path as necessary
import { diffJson } from "diff";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AuditLog() {
  const { data: auditLogs, isLoading } = useAuditLogs();
  console.log("Audit Logs:", auditLogs);

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
        accessorFn: (row) => row.resource?.id,
        header: "ID resursa",
      },
      {
        header: "Changes",
        // Cell: ({ row }) => {
        //   const { beforeChanges, requestBody } = row.original;

        //   // If there's no 'before' state, it's a new creation. Show the whole body as added.
        //   if (!beforeChanges) {
        //     return (
        //       <pre style={{ margin: 0, backgroundColor: "#ddfadd" }}>
        //         {JSON.stringify(requestBody, null, 2)}
        //       </pre>
        //     );
        //   }

        //   // Create a filtered version of beforeChanges that only includes
        //   // keys that are present in the requestBody
        //   const filteredBeforeChanges = requestBody
        //     ? Object.keys(requestBody).reduce(
        //         (filtered, key) => {
        //           // Only copy fields that exist in requestBody
        //           if (key in beforeChanges) {
        //             filtered[key] = beforeChanges[key];
        //           }
        //           return filtered;
        //         },
        //         {} as Record<string, any>,
        //       )
        //     : beforeChanges;

        //   const differences = diffJson(filteredBeforeChanges, requestBody);

        //   return (
        //     <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        //       {differences
        //         .filter((part) => part.added || part.removed)
        //         .map((part, index) => {
        //           const style = {
        //             backgroundColor: part.added ? "#ddfadd" : "#fadddd",
        //           };
        //           return (
        //             <span key={index} style={style}>
        //               {part.value}
        //             </span>
        //           );
        //         })}
        //     </pre>
        //   );
        // },
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
      <h1>Audit</h1>

      <MaterialReactTable table={auditLogsTable} />
    </div>
  );
}
