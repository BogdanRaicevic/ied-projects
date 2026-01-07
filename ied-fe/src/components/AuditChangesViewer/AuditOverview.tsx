import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { AuditLogStatsByDateResponse } from "ied-shared";

export default function AuditOverview({
  auditData,
}: {
  auditData: AuditLogStatsByDateResponse;
}) {
  type AuditOverviewStats = Omit<
    AuditLogStatsByDateResponse,
    "dailyStats" | "userEmail" | "model" | "dateStart" | "dateEnd"
  >;

  const tableData: {
    label: string;
    value: string | number | undefined | null;
    key: keyof AuditOverviewStats;
  }[] = [
    {
      label: "Novi unosi",
      value: auditData.totalNew,
      key: "totalNew",
    },
    {
      label: "Obrisani unosi",
      value: auditData.totalDeleted,
      key: "totalDeleted",
    },
    {
      label: "Ažurirani unosi",
      value: auditData.totalUpdated,
      key: "totalUpdated",
    },
    {
      label: "Prosečan broj izmena po danu",
      value: auditData.averageUpdatesPerDay,
      key: "averageUpdatesPerDay",
    },
    {
      label: "Broj dana sa izmenama u datom periodu (bez praznika)",
      value: auditData.totalWorkedDays,
      key: "totalWorkedDays",
    },

    {
      label: "Broj dana bez izmena u datom periodu (bez praznika)",
      value: auditData.totalUnworkedDays,
      key: "totalUnworkedDays",
    },
    {
      label: "Broj vikend dana sa izmenama u datom periodu",
      value: auditData.totalWorkedWeekendDays,
      key: "totalWorkedWeekendDays",
    },
    {
      label: "Prosečno vreme početka izmena",
      value: auditData.averageEditStartTime,
      key: "averageEditStartTime",
    },
    {
      label: "Prosečno vreme završetka izmena",
      value: auditData.averageEditEndTime,
      key: "averageEditEndTime",
    },
    {
      label: "Prosečno procenjeno vreme rada",
      value: auditData.averageEstimatedWorkTime,
      key: "averageEstimatedWorkTime",
    },
    {
      label: "Prosečno vreme između unosa (u minutima)",
      value: auditData.averageTimeBetweenEntries,
      key: "averageTimeBetweenEntries",
    },
    {
      label: "Prosečno vreme za najveći prekid u radu (u minutima)",
      value: auditData.averageTimeForGreatestGap,
      key: "averageTimeForGreatestGap",
    },
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Stavka</TableCell>
            <TableCell align="right">Vrednost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((item) => (
            <TableRow
              key={item.key}
              sx={{
                "&:nth-of-type(even)": { backgroundColor: "action.hover" },
              }}
            >
              <TableCell component="th" scope="row">
                {item.label}
              </TableCell>
              <TableCell align="right">{String(item.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
