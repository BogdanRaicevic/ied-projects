import { Button } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { updateRacunTemplate } from "../api/docx.api";
import { useLocation } from "react-router-dom";
import { CreatePredracunForm } from "../components/Racun/CreatePredracunForm";
import { fetchSingleFirma } from "../api/firma.api";
import { useEffect, useRef, useState } from "react";
import type { FirmaType, PrijavaNaSeminar, SeminarType } from "../schemas/firmaSchemas";
import { fetchSeminarById } from "../api/seminari.api";
import { Racun } from "../components/Racun/types";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarType | null>(null);
  const formRef = useRef<{ getRacunData: () => Partial<Racun> }>(null);

  const location = useLocation();
  const prijave: PrijavaNaSeminar[] = location.state?.prijave || [];

  useEffect(() => {
    const fetchFirma = async () => {
      try {
        // Fetch firma
        if (prijave[0]?.firma_id) {
          const firmaData = await fetchSingleFirma(prijave[0].firma_id);
          setFirma(firmaData);
        }

        // Fetch seminar
        if (prijave[0]?.seminar_id) {
          const seminarData = await fetchSeminarById(prijave[0].seminar_id);
          setSeminar(seminarData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchFirma();
  }, [prijave]);

  const primalacRacuna = {
    naziv: firma?.naziv_firme || "",
    adresa: firma?.adresa || "",
    pib: firma?.PIB || "",
    mesto: firma?.mesto || "",
    maticniBroj: firma?.maticni_broj || "",
    onlineCena: seminar?.onlineCena || "",
    offlineCena: seminar?.offlineCena || "",
    brojUcesnikaOnline: prijave.filter((p) => p.prisustvo === "online").length || 0,
    brojUcesnikaOffline: prijave.filter((p) => p.prisustvo === "offline").length || 0,
    ukupanBrojUcesnika: prijave.length || 0,
    nazivSeminara: seminar?.naziv || "",
  };

  const handleDocxUpdate = async () => {
    if (formRef.current) {
      const racunData = formRef.current.getRacunData();
      await updateRacunTemplate(racunData);
    }
  };

  return (
    <>
      <PageTitle title={"Racuni"} />
      <CreatePredracunForm primalacRacuna={primalacRacuna} ref={formRef} />
      <Button onClick={handleDocxUpdate} variant="contained">
        odje click
      </Button>
    </>
  );
}
