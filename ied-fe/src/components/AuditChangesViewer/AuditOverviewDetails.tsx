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
            const getRowColor = () => {
              if (isWeekend) return grey[100];
              if (stat.aggregatedUpdated > 0) return green[50];
              return red[50];
            };
            const getHoverColor = () => {
              if (isWeekend) return grey[200];
              if (stat.aggregatedUpdated > 0) return green[100];
              return red[100];
            };

            return (
              <TableRow
                key={stat.date}
                sx={{
                  backgroundColor: getRowColor(),
                  "&:hover": {
                    backgroundColor: getHoverColor(),
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
                <TableCell>
                  {minutesToHoursAndMinutes(stat.estimatedWorkTime)}
                </TableCell>
                <TableCell>{stat.averageTimeBetweenEntries}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return <Box>{table}</Box>;
}
