import { Box, Button, Tab, Tabs } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { updateRacunTemplate } from "../api/docx.api";
import { useLocation } from "react-router-dom";
import { CreatePredracunForm } from "../components/Racun/CreatePredracunForm";
import { fetchSingleFirma } from "../api/firma.api";
import { useEffect, useState } from "react";
import type { FirmaType, PrijavaNaSeminar, SeminarType } from "../schemas/firmaSchemas";
import { fetchSeminarById } from "../api/seminari.api";
import { RacunTypes } from "@ied-shared/constants/racun";
import { CreateKonacniRacunForm } from "../components/Racun/CreateKonacniRacunForm";
import { useRacunStore } from "../components/Racun/store/useRacunStore";
import { IzdavacRacunaSection } from "../components/Racun/components/IzdavacRacunaSection";
import { CreateAvansForm } from "../components/Racun/CreateAvansForm";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useRacunCalculations } from "../components/Racun/hooks/useRacunCalculations";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarType | null>(null);
  const [tabValue, setTabValue] = useState<RacunTypes>(RacunTypes.PREDRACUN);

  // Get store actions
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const getCompleteRacunData = useRacunStore((state) => state.getCompleteRacunData);

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

  // Update store with data
  useEffect(() => {
    // Instead of updating the whole object at once, you can update nested properties individually
    if (seminar) {
      updateNestedField("seminar.onlineCena", seminar.onlineCena || 0);
      updateNestedField("seminar.offlineCena", seminar.offlineCena || 0);
      updateNestedField("seminar.naziv", seminar.naziv || "");
      updateNestedField("seminar.datum", seminar.datum || new Date());
      updateNestedField("seminar.lokacija", seminar.lokacija || "");
    }

    updateNestedField(
      "seminar.brojUcesnikaOnline",
      prijave.filter((p) => p.prisustvo === "online").length || 0
    );
    updateNestedField(
      "seminar.brojUcesnikaOffline",
      prijave.filter((p) => p.prisustvo === "offline").length || 0
    );

    if (firma) {
      updateNestedField("primalacRacuna.naziv", firma.naziv_firme || "");
      updateNestedField("primalacRacuna.adresa", firma.adresa || "");
      updateNestedField("primalacRacuna.pib", firma.PIB || "");
      updateNestedField("primalacRacuna.mesto", firma.mesto || "");
      updateNestedField("primalacRacuna.maticniBroj", firma.maticni_broj || "");
    }
  }, [firma, seminar, prijave, updateNestedField]);

  const handleDocxUpdate = async () => {
    const racunData = getCompleteRacunData();
    console.log("racunData", racunData);

    await updateRacunTemplate(racunData, tabValue);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: RacunTypes) => {
    setTabValue(newValue);
  };

  // Function to render the appropriate form based on current tab
  const renderActiveForm = () => {
    switch (tabValue) {
      case RacunTypes.PREDRACUN:
        return <CreatePredracunForm />;
      case RacunTypes.AVANSNI_RACUN:
        return <CreateAvansForm />;
      case RacunTypes.KONACNI_RACUN:
        return <CreateKonacniRacunForm />;
      default:
        return <CreatePredracunForm />;
    }
  };

  useRacunCalculations();

  return (
    <>
      <PageTitle title={"Racuni"} />
      <IzdavacRacunaSection />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Predračun" value={RacunTypes.PREDRACUN} />
          <Tab label="Avansni račun" value={RacunTypes.AVANSNI_RACUN} />
          <Tab label="Konačni račun" value={RacunTypes.KONACNI_RACUN} />
          {/*<Tab label="Račun" value={RacunTypes.RACUN} /> */}
        </Tabs>
      </Box>

      {/* Render only the active form instead of hiding inactive ones */}
      {renderActiveForm()}

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
