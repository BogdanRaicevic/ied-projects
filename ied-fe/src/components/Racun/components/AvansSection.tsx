import { TipRacuna } from "@ied-shared/types/racuni.zod";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useCallback, useEffect } from "react";
import { getRacunByPozivNaBrojAndIzdavac } from "../../../api/racuni.api";
import { formatToRSDNumber } from "../../../utils/helpers";
import { useRacunStore } from "../store/useRacunStore";

export const AvansSection = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const updateField = useRacunStore((state) => state.updateField);

  const avansPdv =
    (Number(racunData.calculations.avansBezPdv ?? 0) *
      Number(racunData.stopaPdv)) /
    100;
  const avans = Number(racunData.calculations.avansBezPdv) + Number(avansPdv);

  const resetAvansFields = useCallback(() => {
    updateNestedField("calculations.avansBezPdv", 0);
    updateNestedField("seminar.naziv", "");
    updateField("datumUplateAvansa", null);
  }, [updateField, updateNestedField]);

  const fetchAvansniRacun = useCallback(
    async (pozivNaBroj: string) => {
      if (pozivNaBroj.length !== 8 || Number.isNaN(Number(pozivNaBroj))) {
        resetAvansFields();
        return;
      }

      try {
        const avansniRacun = await getRacunByPozivNaBrojAndIzdavac(
          pozivNaBroj,
          racunData.izdavacRacuna,
          TipRacuna.AVANSNI_RACUN,
        );

        if (
          useRacunStore.getState().racunData.linkedPozivNaBroj !== pozivNaBroj
        ) {
          return;
        }

        if (avansniRacun) {
          updateNestedField(
            "calculations.avansBezPdv",
            avansniRacun.calculations.avansBezPdv,
          );
          updateNestedField("seminar.naziv", avansniRacun.seminar.naziv);
          updateField("datumUplateAvansa", avansniRacun.datumUplateAvansa);
        } else {
          resetAvansFields();
        }
      } catch (error) {
        resetAvansFields();
      }
    },
    [racunData.izdavacRacuna, resetAvansFields],
  );

  useEffect(() => {
    if (racunData.linkedPozivNaBroj) {
      fetchAvansniRacun(racunData.linkedPozivNaBroj);
    }
  }, [racunData.linkedPozivNaBroj, fetchAvansniRacun]);

  const handleSearchAvansniRacun = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = event.target.value;

    value = value.replace(/[^0-9]/g, "");

    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "") || "0";
    }

    updateField("linkedPozivNaBroj", value);
  };

  return (
    <Box>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Avans
      </Typography>
      {racunData.tipRacuna === TipRacuna.KONACNI_RACUN && (
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              placeholder="Poziv na broj"
              label="Poziv na broj avansnog računa"
              value={racunData.linkedPozivNaBroj || ""}
              onChange={handleSearchAvansniRacun}
              sx={{ minWidth: 450, mb: 3 }}
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
                      <Chip
                        sx={{ padding: 1, margin: 1 }}
                        label={"AVANSNI RAČUN"}
                        size="small"
                      />
                    </>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={6}>
            <DatePicker
              label="Datum uplate avansa"
              format="yyyy.MM.dd"
              value={
                racunData.datumUplateAvansa
                  ? new Date(racunData.datumUplateAvansa)
                  : null
              }
              onChange={(e) => updateField("datumUplateAvansa", e)}
            ></DatePicker>
          </Grid>
        </Grid>
      )}
      {(racunData.linkedPozivNaBroj ||
        racunData.tipRacuna === TipRacuna.AVANSNI_RACUN) && (
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
                    onChange={(e) =>
                      updateNestedField("seminar.naziv", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="avansBezPdv"
                    value={racunData.calculations.avansBezPdv ?? 0}
                    onChange={(e) =>
                      updateNestedField(
                        "calculations.avansBezPdv",
                        Number(e.target.value) || 0,
                      )
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
