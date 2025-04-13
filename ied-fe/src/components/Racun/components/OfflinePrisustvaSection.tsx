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
import type { Racun } from "../types";
interface OfflinePrisustvaSectionProps {
  racun: Partial<Racun>;
  onRacunChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const OfflinePrisustvaSection = ({ racun, onRacunChange }: OfflinePrisustvaSectionProps) => {
  return (
    <Box>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Prisustva u sali
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
                <TableCell>Jedinica mere</TableCell>
                <TableCell>Količina</TableCell>
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
                    name="jedinicaMere"
                    value={racun.jedinicaMere}
                    onChange={onRacunChange}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="brojUcesnikaOffline"
                    value={racun.brojUcesnikaOffline}
                    onChange={onRacunChange}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Cena u sali</TableCell>
                <TableCell>Popust</TableCell>
                <TableCell>Poreska osnovica</TableCell>
                <TableCell>Stopa PDV</TableCell>
                <TableCell>PDV</TableCell>
                <TableCell>Ukupna naknada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                key="naziv-firme"
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">
                  <TextField
                    sx={{ maxWidth: 100 }}
                    name="offlineCena"
                    variant="filled"
                    value={racun.offlineCena}
                    onChange={onRacunChange}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    sx={{ maxWidth: 70 }}
                    name="popustOffline"
                    variant="filled"
                    value={racun.popustOffline}
                    onChange={onRacunChange}
                  />
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racun.offlinePoreskaOsnovica).toLocaleString("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>{racun.stopaPdv}%</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racun.pdvOffline).toLocaleString("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racun.offlineUkupnaNaknada).toLocaleString("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
