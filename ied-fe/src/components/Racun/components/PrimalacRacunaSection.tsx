import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from "@mui/material";
import { useRacunStore } from "../store/useRacunStore";

export const PrimalacRacunaSection = () => {
  const racun = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Primalac računa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            key="naziv-firme"
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="left">
              <TextField
                name="naziv"
                fullWidth
                variant="filled"
                label="Naziv"
                value={racun.primalacRacuna.naziv || ""}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  updateNestedField("primalacRacuna.naziv", e.target.value)
                }
              />
              <TextField
                name="mesto"
                fullWidth
                variant="filled"
                label="Mesto"
                value={racun.primalacRacuna.mesto || ""}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  updateNestedField("primalacRacuna.mesto", e.target.value)
                }
              />
              <TextField
                name="adresa"
                fullWidth
                variant="filled"
                label="Adresa"
                value={racun.primalacRacuna.adresa || ""}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  updateNestedField("primalacRacuna.adresa", e.target.value)
                }
              />
              <TextField
                name="pib"
                fullWidth
                variant="filled"
                label="PIB"
                value={racun.primalacRacuna.pib || ""}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  updateNestedField("primalacRacuna.pib", e.target.value)
                }
              />
              <TextField
                name="maticniBroj"
                fullWidth
                variant="filled"
                label="Matični broj"
                value={racun.primalacRacuna.maticniBroj || ""}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  updateNestedField(
                    "primalacRacuna.maticniBroj",
                    e.target.value,
                  )
                }
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
