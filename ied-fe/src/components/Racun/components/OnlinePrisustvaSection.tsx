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
import { useRacunStore } from "../store/useRacunStore";

export const OnlinePrisustvaSection = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);

  return (
    <Box>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Online prisustva
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
                    name="naziv"
                    value={racunData.seminar.naziv || ""}
                    onChange={(e) => updateNestedField("seminar.naziv", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="jedinicaMere"
                    value={racunData.seminar.jedinicaMere || ""}
                    onChange={(e) => updateNestedField("seminar.jedinicaMere", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    variant="filled"
                    name="brojUcesnikaOnline"
                    value={racunData.seminar.brojUcesnikaOnline || ""}
                    onChange={(e) =>
                      updateNestedField("seminar.brojUcesnikaOnline", e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Cena online</TableCell>
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
                    name="onlineCena"
                    variant="filled"
                    value={racunData.seminar.onlineCena || ""}
                    onChange={(e) => updateNestedField("seminar.onlineCena", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <TextField
                    sx={{ maxWidth: 70 }}
                    name="popustOnline"
                    variant="filled"
                    value={racunData.seminar.popustOnline || ""}
                    onChange={(e) => updateNestedField("seminar.popustOnline", e.target.value)}
                  />
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racunData.calculations.onlinePoreskaOsnovica).toLocaleString("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>{racunData.stopaPdv}%</Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racunData.calculations.pdvOnline).toLocaleString("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography>
                    {Number(racunData.calculations.onlineUkupnaNaknada).toLocaleString("sr-RS", {
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
