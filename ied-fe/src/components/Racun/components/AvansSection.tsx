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
  Chip,
} from "@mui/material";
import { formatToRSDNumber } from "../../../utils/helpers";
import { useRacunStore } from "../store/useRacunStore";
import { getRacunByPozivNaBrojAndIzdavac } from "../../../api/racuni.api";
import { TipRacuna } from "@ied-shared/types/racuni";

export const AvansSection = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const updateField = useRacunStore((state) => state.updateField);

  const avansPdv = (Number(racunData.seminar.avansBezPdv ?? 0) * Number(racunData.stopaPdv)) / 100;
  const avans = Number(racunData.seminar.avansBezPdv) + Number(avansPdv);

  const handleSearchAvansniRacun = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length === 10) {
      const avansniRacun = await getRacunByPozivNaBrojAndIzdavac(
        value,
        racunData.izdavacRacuna,
        TipRacuna.AVANSNI_RACUN
      );
      updateNestedField("seminar.avansBezPdv", avansniRacun.seminar.avansBezPdv);
      updateNestedField("seminar.naziv", avansniRacun.seminar.naziv);
      updateField("linkedPozivNaBroj", avansniRacun.pozivNaBroj);
      console.log("avansni racun", avansniRacun);
    } else {
      return;
    }
  };

  return (
    <Box>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Avans
      </Typography>
      {racunData.tipRacuna === TipRacuna.KONACNI_RACUN && (
        <TextField
          placeholder="Poziv na broj"
          onChange={handleSearchAvansniRacun}
          sx={{ minWidth: 450, mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <>
                  <Chip
                    sx={{ padding: 1, margin: 1 }}
                    label={racunData.izdavacRacuna}
                    size="small"
                  />
                  <Chip sx={{ padding: 1, margin: 1 }} label={"AVANSNI RAČUN"} size="small" />
                </>
              ),
            },
          }}
        />
      )}
      {(racunData.linkedPozivNaBroj || racunData.tipRacuna === TipRacuna.AVANSNI_RACUN) && (
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
                    name="naziv"
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
      )}
    </Box>
  );
};
