import { Box, Button, Tab, Tabs } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { updateRacunTemplate } from "../api/docx.api";
import { useLocation } from "react-router-dom";
import { CreatePredracunForm } from "../components/Racun/CreatePredracunForm";
import { fetchSingleFirma } from "../api/firma.api";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FirmaType, PrijavaNaSeminar, SeminarType } from "../schemas/firmaSchemas";
import { fetchSeminarById } from "../api/seminari.api";
import { IzdavacRacuna, Racun } from "../components/Racun/types";
import { IzdavacRacunaSection } from "../components/Racun/IzdavacRacunaSection";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarType | null>(null);
  const [selectedFirmaData, setSelectedFirmaData] = useState<IzdavacRacuna | null>(null);
  const [selectedTekuciRacun, setSelectedTekuciRacun] = useState<string>("");
  const [tabValue, setTabValue] = useState(0);

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

  const handleFirmaChange = useCallback((data: IzdavacRacuna | null) => {
    setSelectedFirmaData(data);
  }, []);

  const handleTekuciRacunChange = useCallback((value: string) => {
    setSelectedTekuciRacun(value);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <PageTitle title={"Racuni"} />
      <IzdavacRacunaSection
        selectedFirmaData={selectedFirmaData}
        onFirmaChange={handleFirmaChange}
        onTekuciRacunChange={handleTekuciRacunChange}
        selectedTekuciRacun={selectedTekuciRacun}
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Predračun" />
        </Tabs>
      </Box>
      <Box role="tabpanel" hidden={tabValue !== 0}>
        <CreatePredracunForm
          primalacRacuna={primalacRacuna}
          selectedFirmaData={selectedFirmaData}
          selectedTekuciRacun={selectedTekuciRacun}
          ref={formRef}
        />
      </Box>
      <Box role="tabpanel" hidden={tabValue !== 1}>
        Item Two
      </Box>
      <Box role="tabpanel" hidden={tabValue !== 2}>
        Item Three
      </Box>
      <Button sx={{ mt: 3, mb: 3 }} onClick={handleDocxUpdate} variant="contained">
        Generisi dokument
      </Button>
    </>
  );
}
