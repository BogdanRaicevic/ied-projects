import {
  Grid2,
  Paper,
  TextField,
  Divider,
  TableContainer,
  Table,
  Typography,
  Box,
} from "@mui/material";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { IzdavacRacunaSection } from "./IzdavacRacunaSection";
import { PrimalacRacunaSection } from "./PrimalacRacunaSection";
import { OnlinePrisustvaSection } from "./OnlinePrisustvaSection";
import { OfflinePrisustvaSection } from "./OfflinePrisustvaSection";

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
  izdavacRacuna: {
    naziv: string;
    kontaktTelefoni: string[];
    pib: string;
    maticniBroj: string;
    brojResenjaOEvidencijiZaPDV: string;
    tekuciRacun: string;
  };
};

export type IzdavacRacuna = {
  naziv: string;
  kontaktTelefoni: string[];
  pib: string;
  maticniBroj: string;
  brojResenjaOEvidencijiZaPDV: string;
  tekuciRacuni: string[];
};

export interface RacunFormRef {
  getRacunData: () => Partial<Racun>;
}

interface RacunFormProps {
  primalacRacuna: PrimalacRacuna;
}

export const RacunForm = forwardRef<RacunFormRef, RacunFormProps>(({ primalacRacuna }, ref) => {
  const [selectedFirmaData, setSelectedFirmaData] = useState<IzdavacRacuna | null>(null);
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
    izdavacRacuna: {
      naziv: selectedFirmaData?.naziv ?? "",
      kontaktTelefoni: selectedFirmaData?.kontaktTelefoni ?? [],
      pib: selectedFirmaData?.pib ?? "",
      maticniBroj: selectedFirmaData?.maticniBroj ?? "",
      brojResenjaOEvidencijiZaPDV: selectedFirmaData?.brojResenjaOEvidencijiZaPDV ?? "",
      tekuciRacun: selectedFirmaData?.tekuciRacuni?.[0] ?? "",
    },
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
      izdavacRacuna: {
        naziv: selectedFirmaData?.naziv ?? "",
        kontaktTelefoni: selectedFirmaData?.kontaktTelefoni ?? [],
        pib: selectedFirmaData?.pib ?? "",
        maticniBroj: selectedFirmaData?.maticniBroj ?? "",
        brojResenjaOEvidencijiZaPDV: selectedFirmaData?.brojResenjaOEvidencijiZaPDV ?? "",
        tekuciRacun: selectedFirmaData?.tekuciRacuni?.[0] ?? "",
      },
    });
  }, [primalacRacuna]);

  useEffect(() => {
    if (selectedFirmaData) {
      setRacun((prev) => ({
        ...prev,
        izdavacRacuna: {
          naziv: selectedFirmaData.naziv,
          kontaktTelefoni: selectedFirmaData.kontaktTelefoni,
          pib: selectedFirmaData.pib,
          maticniBroj: selectedFirmaData.maticniBroj,
          brojResenjaOEvidencijiZaPDV: selectedFirmaData.brojResenjaOEvidencijiZaPDV,
          tekuciRacun: selectedFirmaData.tekuciRacuni[0] ?? "",
        },
      }));
    }
  }, [selectedFirmaData]);

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

  return (
    <Grid2 container>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <IzdavacRacunaSection
            selectedFirmaData={selectedFirmaData}
            onFirmaChange={(data) => setSelectedFirmaData(data)}
            onTekuciRacunChange={(value) => setRacun((prev) => ({ ...prev, tekuciRacun: value }))}
          />
        </Table>
      </TableContainer>
      <Grid2 size={12}>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <Box>
          <PrimalacRacunaSection racun={racun} onRacunChange={handleRacunChange} />
        </Box>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <OnlinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
        <OfflinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
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
