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
import type { Racun } from "../types";

interface PrimalacRacunaSectionProps {
  racun: Partial<Racun>;
  onRacunChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PrimalacRacunaSection = ({ racun, onRacunChange }: PrimalacRacunaSectionProps) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Primalac računa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key="naziv-firme" sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">
              <TextField
                name="naziv"
                fullWidth
                variant="filled"
                label="Naziv"
                value={racun.naziv}
                sx={{ mb: 2 }}
                onChange={onRacunChange}
              />
              <TextField
                name="adresa"
                fullWidth
                variant="filled"
                label="Adresa"
                value={`${racun.mesto}, ${racun.adresa}`}
                sx={{ mb: 2 }}
                onChange={onRacunChange}
              />
              <TextField
                name="pib"
                fullWidth
                variant="filled"
                label="PIB"
                value={racun.pib}
                sx={{ mb: 2 }}
                onChange={onRacunChange}
              />
              <TextField
                name="maticniBroj"
                fullWidth
                variant="filled"
                label="Matični broj"
                value={racun.maticniBroj}
                sx={{ mb: 2 }}
                onChange={onRacunChange}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
