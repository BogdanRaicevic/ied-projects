import {
  Grid2,
  Paper,
  TextField,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SelectFirma from "./SelectFirma";

type PrimalacRacuna = {
  naziv: string;
  adresa: string;
  pib: number | string;
  mesto: string;
  maticniBroj: number | string;
  onlineCena: number | string;
  offlineCena: number | string;
  brojUcesnikaOnline: number | string;
  brojUcesnikaOffline: number | string;
  ukupanBrojUcesnika: number | string;
  nazivSeminara?: string;
};

export type Racun = PrimalacRacuna & {
  popustOnline: number | string;
  popustOffline: number | string;
  stopaPdv: number | string;
  pdvOffline: number;
  pdvOnline: number;
  onlineUkupnaNaknada: number;
  offlineUkupnaNaknada: number;
  onlinePoreskaOsnovica: number;
  offlinePoreskaOsnovica: number;
  jedinicaMere: string;
  rokZaUplatu: number;
  pozivNaBroj: string;
  ukupnaNaknada: number;
  ukupanPdv: number;
};

export interface RacunFormRef {
  getRacunData: () => Partial<Racun>;
}

interface RacunFormProps {
  primalacRacuna: PrimalacRacuna;
}

export const RacunForm = forwardRef<RacunFormRef, RacunFormProps>(({ primalacRacuna }, ref) => {
  const [racun, setRacun] = useState<Partial<Racun>>({
    naziv: primalacRacuna.naziv || "",
    adresa: primalacRacuna.adresa || "",
    pib: primalacRacuna.pib || "",
    mesto: primalacRacuna.mesto || "",
    maticniBroj: primalacRacuna.maticniBroj || "",
    onlineCena: primalacRacuna.onlineCena || "",
    offlineCena: primalacRacuna.offlineCena || "",
    brojUcesnikaOnline: primalacRacuna.brojUcesnikaOnline || 0,
    brojUcesnikaOffline: primalacRacuna.brojUcesnikaOffline || 0,
    ukupanBrojUcesnika: primalacRacuna.ukupanBrojUcesnika || 0,
    nazivSeminara: primalacRacuna.nazivSeminara || "",
    jedinicaMere: "Broj učesnika",
    rokZaUplatu: 5,
    pozivNaBroj: "",
  });

  // NOTE: this is a workaround to update the form when the data changes
  useEffect(() => {
    setRacun({
      naziv: primalacRacuna.naziv || "",
      adresa: primalacRacuna.adresa || "",
      pib: primalacRacuna.pib || "",
      mesto: primalacRacuna.mesto || "",
      maticniBroj: primalacRacuna.maticniBroj || "",
      onlineCena: primalacRacuna.onlineCena || "",
      offlineCena: primalacRacuna.offlineCena || "",
      brojUcesnikaOnline: primalacRacuna.brojUcesnikaOnline || 0,
      brojUcesnikaOffline: primalacRacuna.brojUcesnikaOffline || 0,
      ukupanBrojUcesnika: primalacRacuna.ukupanBrojUcesnika || 0,
      nazivSeminara: primalacRacuna.nazivSeminara || "",
      popustOnline: 0,
      popustOffline: 0,
      stopaPdv: 20,
      jedinicaMere: "Broj učesnika",
      rokZaUplatu: 5,
      pozivNaBroj: "",
    });
  }, [primalacRacuna]);

  useEffect(() => {
    const onlineCena = Number(racun.onlineCena) || 0;
    const offlineCena = Number(racun.offlineCena) || 0;
    const brojUcesnikaOnline = Number(racun?.brojUcesnikaOnline) || 0;
    const brojUcesnikaOffline = Number(racun?.brojUcesnikaOffline) || 0;
    const popustOnline = Number(racun?.popustOnline) || 0;
    const popustOffline = Number(racun?.popustOffline) || 0;
    const stopaPdv = Number(racun.stopaPdv) || 0;

    const onlineUkupnaNaknada =
      onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100) * (1 + stopaPdv / 100);

    const offlineUkupnaNaknada =
      offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100) * (1 + stopaPdv / 100);

    const onlinePoreskaOsnovica = onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100);
    const offlinePoreskaOsnovica = offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100);

    setRacun((prev) => ({
      ...prev,
      onlineUkupnaNaknada: onlineUkupnaNaknada,
      offlineUkupnaNaknada: offlineUkupnaNaknada,
      pdvOffline: (offlinePoreskaOsnovica * stopaPdv) / 100,
      pdvOnline: (onlinePoreskaOsnovica * stopaPdv) / 100,
      onlinePoreskaOsnovica: onlinePoreskaOsnovica,
      offlinePoreskaOsnovica: offlinePoreskaOsnovica,
      ukupnaNaknada: onlineUkupnaNaknada + offlineUkupnaNaknada,
      ukupanPdv:
        (offlinePoreskaOsnovica * stopaPdv) / 100 + (onlinePoreskaOsnovica * stopaPdv) / 100,
    }));
  }, [
    racun.onlineCena,
    racun.offlineCena,
    racun.brojUcesnikaOnline,
    racun.brojUcesnikaOffline,
    racun.popustOnline,
    racun.popustOffline,
    racun.stopaPdv,
  ]);

  const handleRacunChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRacun((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  useImperativeHandle(ref, () => ({
    getRacunData: () => racun,
  }));

  const [selectedFirmaData, setSelectedFirmaData] = useState(null);

  return (
    <Grid2 container>
      <Grid2 component={Paper} size={12} container>
        <Grid2 size={7}>
          <Box sx={{ padding: "1rem" }}>
            <TextField
              fullWidth
              variant="filled"
              label="Podaci o izdavaocu računa"
              value={selectedFirmaData?.podaciOIzdavaocuRacuna || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Kontakt telefoni"
              value={selectedFirmaData?.kontaktTelefoni.join(", ") || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="PIB"
              value={selectedFirmaData?.pib || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Matični broj"
              value={selectedFirmaData?.maticniBroj || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Broj rešenja o evidenciji za PDV"
              value={selectedFirmaData?.brojResenjaOEvidencijiZaPDV || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Tekući račun"
              value={selectedFirmaData?.tekuciRacuni || ""}
              sx={{ mb: 2 }}
            />
          </Box>
        </Grid2>
        <Grid2 size={5}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 1,
            }}
          >
            {/* <img src={iedLogo} style={{ maxWidth: "100%", maxHeight: "100%" }} /> */}
            <SelectFirma onFirmaChange={(data) => setSelectedFirmaData(data)} />{" "}
          </Box>
        </Grid2>
      </Grid2>
      <Grid2 size={12}>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <Box>
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
                      value={racun.naziv}
                      sx={{ mb: 2 }}
                      onChange={handleRacunChange}
                    />
                    <TextField
                      name="adresa"
                      fullWidth
                      variant="filled"
                      label="Adresa"
                      value={`${racun.mesto}, ${racun.adresa}`}
                      sx={{ mb: 2 }}
                      onChange={handleRacunChange}
                    />
                    <TextField
                      name="pib"
                      fullWidth
                      variant="filled"
                      label="PIB"
                      value={racun.pib}
                      sx={{ mb: 2 }}
                      onChange={handleRacunChange}
                    />
                    <TextField
                      name="maticniBroj"
                      fullWidth
                      variant="filled"
                      label="Matični broj"
                      value={racun.maticniBroj}
                      sx={{ mb: 2 }}
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Divider sx={{ mt: 3, mb: 3 }} />
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
                  <TableCell>Vrsta usluge</TableCell>
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
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      variant="filled"
                      name="jedinicaMere"
                      value={racun.jedinicaMere}
                      onChange={handleRacunChange}
                    />
                  </TableCell>

                  <TableCell align="left">
                    <TextField
                      variant="filled"
                      name="brojUcesnikaOnline"
                      value={racun.brojUcesnikaOnline}
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Cena po jedinici</TableCell>
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
                      value={racun.onlineCena}
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      sx={{ maxWidth: 70 }}
                      name="popustOnline"
                      variant="filled"
                      value={racun.popustOnline}
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      {Number(racun.onlinePoreskaOsnovica).toLocaleString("sr-RS", {
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
                      {Number(racun.pdvOnline).toLocaleString("sr-RS", {
                        style: "currency",
                        currency: "RSD",
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      {Number(racun.onlineUkupnaNaknada).toLocaleString("sr-RS", {
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

        <Typography align="center" variant="h4" sx={{ mb: 3 }}>
          Offline prisustva
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
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      variant="filled"
                      name="jedinicaMere"
                      value={racun.jedinicaMere}
                      onChange={handleRacunChange}
                    />
                  </TableCell>

                  <TableCell align="left">
                    <TextField
                      variant="filled"
                      name="brojUcesnikaOffline"
                      value={racun.brojUcesnikaOffline}
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Cena po jedinici</TableCell>
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
                      onChange={handleRacunChange}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      sx={{ maxWidth: 70 }}
                      name="popustOffline"
                      variant="filled"
                      value={racun.popustOffline}
                      onChange={handleRacunChange}
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
        <Box>
          {/* // ukupan zbir za PDV i naknadu */}
          <Box>
            <Typography variant="h6" sx={{ mr: 1 }}>
              Ukupna naknada po svim stavkama:{" "}
              {(
                Number(racun.onlineUkupnaNaknada) + Number(racun.offlineUkupnaNaknada)
              ).toLocaleString("sr-RS", {
                style: "currency",
                currency: "RSD",
                minimumFractionDigits: 2,
              })}
            </Typography>
            <Typography variant="h6" sx={{ mr: 1 }}>
              Ukupni PDV po svim stavkama:{" "}
              {(Number(racun.pdvOnline) + Number(racun.pdvOffline)).toLocaleString("sr-RS", {
                style: "currency",
                currency: "RSD",
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-end",
            }}
          >
            <Typography variant="h6" sx={{ mr: 1 }}>
              Rok za uplatu
            </Typography>
            <TextField
              name="rokZaUplatu"
              variant="filled"
              value={racun.rokZaUplatu}
              sx={{ maxWidth: 60 }}
              onChange={handleRacunChange}
            />
            <Typography variant="h6" sx={{ ml: 1 }}>
              dana
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mt: 3 }} />
      </Grid2>
    </Grid2>
  );
});
