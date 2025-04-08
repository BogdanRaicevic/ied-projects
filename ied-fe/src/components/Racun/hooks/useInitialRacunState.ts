import { useState, useEffect } from "react";
import type { Racun, PrimalacRacuna, IzdavacRacuna } from "../types";

interface UseInitialRacunStateProps {
  primalacRacuna: PrimalacRacuna;
  selectedFirmaData: IzdavacRacuna | null;
}

const getInitialRacunState = (
  primalacRacuna: PrimalacRacuna,
  selectedFirmaData: IzdavacRacuna | null
): Partial<Racun> => ({
  naziv: primalacRacuna.naziv || "",
  adresa: primalacRacuna.adresa || "",
  pib: primalacRacuna.pib || "",
  lokacijaSeminara: primalacRacuna.lokacijaSeminara || "",
  datumPrometaUsluge: primalacRacuna.datumPrometaUsluge || new Date(),
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
  avansBezPdv: 0,
});

export const useInitialRacunState = ({
  primalacRacuna,
  selectedFirmaData,
}: UseInitialRacunStateProps) => {
  const [racun, setRacun] = useState<Partial<Racun>>(() =>
    getInitialRacunState(primalacRacuna, selectedFirmaData)
  );

  useEffect(() => {
    setRacun(getInitialRacunState(primalacRacuna, selectedFirmaData));
  }, [primalacRacuna, selectedFirmaData]);

  return { racun, setRacun };
};
