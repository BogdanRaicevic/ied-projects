import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Typography,
} from "@mui/material";
import type { Racun } from "./../types";
import { formatToRSDNumber } from "../../../utils/helpers";

interface AvansSectionProps {
  racun: Partial<Racun>;
  onRacunChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AvansSection = ({ racun, onRacunChange }: AvansSectionProps) => {
  const avansPdv = (Number(racun.avansBezPdv ?? 0) * Number(racun.stopaPdv)) / 100;
  const avans = Number(racun.avansBezPdv) + Number(avansPdv);

  return (
    <Box>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Avans
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TableContainer component={Paper}>
          <Table
            sx={{
              border: 0,
              borderBottom: 1,
              borderStyle: "dashed",
              mb: 3,
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Vrsta usluge</TableCell>
                <TableCell>Avans bez PDV</TableCell>
                <TableCell>Stopa PDV</TableCell>
                <TableCell>PDV</TableCell>
                <TableCell>Uplaćen avans</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                key="naziv-firme"
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="nazivSeminara"
                    value={racun.nazivSeminara}
                    onChange={onRacunChange}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="avansBezPdv"
                    value={racun.avansBezPdv === 0 ? "" : racun.avansBezPdv}
                    onChange={onRacunChange}
                  />
                </TableCell>
                <TableCell align="left">
                  <Typography>{racun.stopaPdv}%</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>{formatToRSDNumber(avansPdv)}</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>{formatToRSDNumber(avans)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
