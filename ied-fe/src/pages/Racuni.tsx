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
import {
  IzdavacRacunaSection,
  IzdavacRacunaSectionRef,
} from "../components/Racun/IzdavacRacunaSection";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { CreateAvansForm } from "../components/Racun/CreateAvansForm";
import { RacunTypes } from "@ied-shared/constants/racun";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarType | null>(null);
  const [selectedFirmaData, setSelectedFirmaData] = useState<IzdavacRacuna | null>(null);
  const [tabValue, setTabValue] = useState<RacunTypes>(RacunTypes.PREDRACUN);

  const formRef = useRef<{ getRacunData: () => Partial<Racun> }>(null);
  const izdavacRacunaRef = useRef<IzdavacRacunaSectionRef>(null);

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
    if (formRef.current && izdavacRacunaRef.current) {
      const izdavacRacunaData = izdavacRacunaRef.current.getIzdavacRacunaData();
      const tekuciRacun = izdavacRacunaRef.current.getTekuciRacun();
      const formData = formRef.current.getRacunData();

      const racunData = {
        ...formData,
        izdavacRacuna: {
          ...izdavacRacunaData,
          tekuciRacun,
        },
      } as Partial<Racun>;

      await updateRacunTemplate(racunData, tabValue);
    }
  };

  const handleFirmaChange = useCallback((data: IzdavacRacuna | null) => {
    setSelectedFirmaData(data);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: RacunTypes) => {
    setTabValue(newValue);
  };

  return (
    <>
      <PageTitle title={"Racuni"} />
      <IzdavacRacunaSection
        ref={izdavacRacunaRef}
        selectedFirmaData={selectedFirmaData}
        onFirmaChange={handleFirmaChange}
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Predračun" value={RacunTypes.PREDRACUN} />
          <Tab label="Avansni račun" value={RacunTypes.AVANSNI_RACUN} />
          {/* <Tab label="Konačni račun" value={RacunTypes.KONACNI_RACUN} />
          <Tab label="Račun" value={RacunTypes.RACUN} /> */}
        </Tabs>
      </Box>
      <Box role="tabpanel" hidden={tabValue !== RacunTypes.PREDRACUN}>
        <CreatePredracunForm
          primalacRacuna={primalacRacuna}
          selectedFirmaData={selectedFirmaData}
          selectedTekuciRacun={izdavacRacunaRef.current?.getTekuciRacun() || ""}
          ref={formRef}
        />
      </Box>
      <Box role="tabpanel" hidden={tabValue !== RacunTypes.AVANSNI_RACUN}>
        <CreateAvansForm
          primalacRacuna={primalacRacuna}
          selectedFirmaData={selectedFirmaData}
          selectedTekuciRacun={izdavacRacunaRef.current?.getTekuciRacun() || ""}
          ref={formRef}
        />
      </Box>
      <Box role="tabpanel" hidden={tabValue !== RacunTypes.KONACNI_RACUN}>
        U izradi Konačni račun
      </Box>
      <Box role="tabpanel" hidden={tabValue !== RacunTypes.RACUN}>
        U izradi Račun
      </Box>
      <Button
        sx={{ mt: 3, mb: 3 }}
        onClick={handleDocxUpdate}
        variant="contained"
        endIcon={<PostAddIcon />}
      >
        Ođe Klik
      </Button>
    </>
  );
}
