import { grey } from "@mui/material/colors";
import { Box } from "@mui/system";
import { formatDate } from "date-fns";
import type { AuditLogType } from "ied-shared";
import { generateStructuredDiff } from "../../utils/diffGenerator";
import type { DataTableColumn } from "../DataTable/DataTable";
import AddedChip from "../styled/AddedChip";
import RemovedChip from "../styled/RemovedChip";
import { AuditChangesViewer } from "./AuditChangesViewer";

export const auditLogColumns: DataTableColumn<AuditLogType>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return formatDate(date, "yyyy-MM-dd");
    },
  },
  {
    accessorKey: "userEmail",
    header: "Korisnik",
  },
  {
    accessorKey: "resource.model",
    header: "Tip resursa",
    cell: ({ row }) => {
      const { resource, before, after } = row.original;
      const doc = after || before;
      const model = resource.model;
      if (!doc) {
        return "N/A";
      }
      const id = doc._id;
      let name = "";

      if (model === "Firma") {
        name = doc.naziv_firme || "Nema naziv";
      } else if (model === "Seminar") {
        name = doc.naziv || "Nema naziv";
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {model}
          <div>{name}</div>
          <small style={{ color: grey[500] }}>ID: {id}</small>
        </Box>
      );
    },
  },

  {
    header: "Promene",
    minSize: 500,
    cell: ({ row }) => {
      const { before, after } = row.original;

      const changes = generateStructuredDiff(before, after);

      // Handle root document deletion
      if (before && !after) {
        return (
          <Box>
            <RemovedChip label="obrisano" />
          </Box>
        );
      }

      // Handle root document creation
      if (!before && after) {
        return (
          <Box>
            <AddedChip label="dodato" />
          </Box>
        );
      }

      if (!changes) {
        return null;
      }

      return <AuditChangesViewer changes={changes} />;
    },
  },
];
