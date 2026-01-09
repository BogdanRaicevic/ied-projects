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
import { green, grey, red } from "@mui/material/colors";
import type { AuditLogStatsByDateResponse } from "ied-shared";
import {
  getDayInfo,
  getTimeFromISODate,
  minutesToHoursAndMinutes,
  populateMissingDays,
} from "../../utils/audit-log.helpers";

const headers = [
  "Datum",
  "Dan u nedelji",
  "Novi unosi",
  "Obrisani unosi",
  "Ažurirani unosi",
  "Najranija izmena",
  "Najkasnija izmena",
  "Procenjeno vreme rada",
  "Prosečno vreme između unosa",
  "Najveća pauza između unosa",
];

export default function AuditOverviewDetails({
  auditData,
}: {
  auditData: AuditLogStatsByDateResponse;
}) {
  const updatedStats = populateMissingDays({
    dailyStats: auditData.dailyStats,
    dateStart: auditData.dateStart,
    dateEnd: auditData.dateEnd,
  });

  const getRowColor = (isWeekend: boolean, hasUpdates: boolean) => {
    if (isWeekend) return grey[100];
    if (hasUpdates) return green[50];
    return red[50];
  };
  const getHoverColor = (isWeekend: boolean, hasUpdates: boolean) => {
    if (isWeekend) return grey[200];
    if (hasUpdates) return green[100];
    return red[100];
  };

  return (
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
            const colors = getRowColor(isWeekend, stat.aggregatedUpdated > 0);
            const hoverColors = getHoverColor(
              isWeekend,
              stat.aggregatedUpdated > 0,
            );

            return (
              <TableRow
                key={stat.date}
                sx={{
                  backgroundColor: colors,
                  "&:hover": { backgroundColor: hoverColors },
                }}
              >
                <TableCell>{stat.date}</TableCell>
                <TableCell>{dayName}</TableCell>
                <TableCell>{stat.new}</TableCell>
                <TableCell>{stat.deleted}</TableCell>
                <TableCell>{stat.aggregatedUpdated}</TableCell>
                <TableCell>{getTimeFromISODate(stat.earliestEdit)}</TableCell>
                <TableCell>{getTimeFromISODate(stat.latestEdit)}</TableCell>
                <TableCell>
                  {minutesToHoursAndMinutes(stat.estimatedWorkTime)}
                </TableCell>
                <TableCell>
                  {minutesToHoursAndMinutes(stat.averageTimeBetweenEntries)}
                </TableCell>
                <TableCell>
                  {minutesToHoursAndMinutes(stat.biggestGapBetweenEntries)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
