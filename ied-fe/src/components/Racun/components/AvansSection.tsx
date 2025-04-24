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
import { formatToRSDNumber } from "../../../utils/helpers";
import { useRacunStore } from "../store/useRacunStore";

export const AvansSection = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);

  const avansPdv = (Number(racunData.seminar.avansBezPdv ?? 0) * Number(racunData.stopaPdv)) / 100;
  const avans = Number(racunData.seminar.avansBezPdv) + Number(avansPdv);

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
                <TableCell>Seminar</TableCell>
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
                    value={racunData.seminar.naziv || ""}
                    onChange={(e) => updateNestedField("seminar.naziv", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="avansBezPdv"
                    value={racunData.seminar.avansBezPdv ?? 0}
                    onChange={(e) => updateNestedField("seminar.avansBezPdv", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <Typography>{racunData.stopaPdv}%</Typography>
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
