import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { SeminarZodType } from "ied-shared";
import type { MRT_Row } from "material-react-table";
import { useMemo } from "react";
import PrijaveSeminarTable from "./PrijaveSeminarTable";

const SeminarSubTable = ({ row }: { row: MRT_Row<SeminarZodType> }) => {
  const participants = row.original.prijave;

  const groupedParticipants = useMemo(() => {
    if (!participants) return {};
    return participants.reduce(
      (acc, curr) => {
        const key = curr.firma_naziv;
        if (!key) {
          return acc;
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      },
      {} as Record<string, typeof participants>,
    );
  }, [participants]);

  if (!participants || participants.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              "& > *": { borderBottom: "unset" },
              backgroundColor: "#95bb9f",
            }}
          >
            <TableCell />
            <TableCell>Akcije</TableCell>
            <TableCell>Naziv Firme</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell>Broj Prijavljenih</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedParticipants).map(([naziv_firme, prijave]) => {
            return (
              <PrijaveSeminarTable
                key={naziv_firme}
                seminarId={row.original._id || ""}
                prijave={prijave}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SeminarSubTable;
