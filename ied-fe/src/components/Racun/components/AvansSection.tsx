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
import { TipRacuna } from "@ied-shared/types/racuni.zod";

export const AvansSection = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const updateField = useRacunStore((state) => state.updateField);

  const avansPdv =
    (Number(racunData.calculations.avansBezPdv ?? 0) * Number(racunData.stopaPdv)) / 100;
  const avans = Number(racunData.calculations.avansBezPdv) + Number(avansPdv);

  const handleSearchAvansniRacun = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateField("linkedPozivNaBroj", value);

    if (value.length === 8 && !isNaN(Number(value))) {
      const avansniRacun = await getRacunByPozivNaBrojAndIzdavac(
        value,
        racunData.izdavacRacuna,
        TipRacuna.AVANSNI_RACUN
      );
      updateNestedField("calculations.avansBezPdv", avansniRacun.calculations.avansBezPdv);
      updateNestedField("seminar.naziv", avansniRacun.seminar.naziv);
    } else {
      updateNestedField("calculations.avansBezPdv", 0);
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
          value={racunData.linkedPozivNaBroj || 0}
          onChange={handleSearchAvansniRacun}
          sx={{ minWidth: 450, mb: 3 }}
          type="number"
          slotProps={{
            htmlInput: {
              maxLength: 10,
              inputMode: "numeric",
            },
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
                    value={racunData.seminar.naziv ?? ""}
                    onChange={(e) => updateNestedField("seminar.naziv", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="avansBezPdv"
                    value={racunData.calculations.avansBezPdv ?? 0}
                    onChange={(e) =>
                      updateNestedField("calculations.avansBezPdv", Number(e.target.value) || 0)
                    }
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
