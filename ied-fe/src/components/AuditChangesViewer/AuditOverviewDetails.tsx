import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import type { AuditLogStatsByDateResponse } from "ied-shared";
import {
  getDayInfo,
  getTimeFromISODate,
  populateMissingDays,
} from "../../utils/audit-log.helpers";

export default function AuditOverviewDetails({
  auditData,
}: {
  auditData: AuditLogStatsByDateResponse;
}) {
  const headers = [
    "Datum",
    "Dan u nedelji",
    "Novi unosi",
    "Obrisani unosi",
    "Ažurirani unosi",
    "Najranija izmena",
    "Najkasnija izmena",
    "Procenjeno vreme rada (min)",
    "Prosečno vreme između unosa (min)",
  ];

  const updatedStats = populateMissingDays({
    dailyStats: auditData.dailyStats,
    dateStart: auditData.dateStart,
    dateEnd: auditData.dateEnd,
  });

  const table = (
    <TableContainer component={Paper} sx={{ mt: 3, maxHeight: "80vh" }}>
      <Table sx={{ tableLayout: "fixed" }} stickyHeader>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header} sx={{ fontWeight: "bold" }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {updatedStats.map((stat) => {
            const { dayName, isWeekend } = getDayInfo(stat.date);
            return (
              <TableRow
                key={stat.date}
                sx={{
                  backgroundColor: isWeekend ? grey[100] : "transparent",
                  "&:hover": {
                    backgroundColor: isWeekend ? grey[200] : grey[50],
                  },
                }}
              >
                <TableCell>{stat.date}</TableCell>
                <TableCell>{dayName}</TableCell>
                <TableCell>{stat.new}</TableCell>
                <TableCell>{stat.deleted}</TableCell>
                <TableCell>{stat.aggregatedUpdated}</TableCell>
                <TableCell>{getTimeFromISODate(stat.earliestEdit)}</TableCell>
                <TableCell>{getTimeFromISODate(stat.latestEdit)}</TableCell>
                <TableCell>{stat.estimatedWorkTime.toFixed(2)}</TableCell>
                <TableCell>
                  {stat.averageTimeBetweenEntries.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return <Box>{table}</Box>;
}
