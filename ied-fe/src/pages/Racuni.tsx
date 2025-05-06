import { Alert, Box, Button, Snackbar, Tab, Tabs } from "@mui/material";
import PageTitle from "../components/PageTitle";
import { generateRacunDocument } from "../api/docx.api";
import { useLocation, useNavigate } from "react-router-dom";
import { CreatePredracunForm } from "../components/Racun/CreatePredracunForm";
import { fetchSingleFirma } from "../api/firma.api";
import { useEffect, useMemo, useState } from "react";
import { type FirmaType } from "../schemas/firmaSchemas";
import { fetchSeminarById } from "../api/seminari.api";
import { CreateKonacniRacunForm } from "../components/Racun/CreateKonacniRacunForm";
import { useRacunStore } from "../components/Racun/store/useRacunStore";
import { IzdavacRacunaSection } from "../components/Racun/components/IzdavacRacunaSection";
import { CreateAvansForm } from "../components/Racun/CreateAvansForm";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useRacunCalculations } from "../components/Racun/hooks/useRacunCalculations";
import { PrijavaZodType, SeminarZodType, TipRacuna } from "@ied-shared/index";
import handlePromiseError from "../utils/helpers";
import { PretrageRacuna } from "../components/Racun/PretrageRacuna";
import { fetchRacunById, saveNewRacun, updateRacunById } from "../api/racuni.api";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarZodType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null); // Keep this for persistent errors if needed
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  // Get store actions
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const updateField = useRacunStore((state) => state.updateField);
  const getCompleteRacunData = useRacunStore((state) => state.getCompleteRacunData);
  const setRacunData = useRacunStore((state) => state.updateRacunData);
  const reset = useRacunStore((state) => state.reset);
  const resetSeminarCalculationData = useRacunStore((state) => state.resetSeminarCalculationData);
  const racunData = useRacunStore((state) => state.racunData);

  const location = useLocation();
  const prijave: PrijavaZodType[] = useMemo(
    () => location.state?.prijave || [],
    [location.state?.prijave]
  );
  const seminarId: string = useMemo(
    () => location.state?.seminarId || "",
    [location.state?.seminarId]
  );

  const initialTab = seminarId ? TipRacuna.PREDRACUN : "pretrage";
  const [tabValue, setTabValue] = useState<TipRacuna | "pretrage">(initialTab);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFirma = async () => {
      try {
        // Fetch firma
        if (prijave[0]?.firma_id) {
          const firmaData = await fetchSingleFirma(prijave[0].firma_id);
          setFirma(firmaData);
        }

        // Fetch seminar
        if (seminarId) {
          const seminarData = await fetchSeminarById(seminarId);
          setSeminar(seminarData);
        }
        updateField("tipRacuna", TipRacuna.PREDRACUN);
      } catch (error) {
        console.error("Error:", error);
        setApiError("Greška pri učitavanju podataka firme ili seminara.");
      }
    };

    fetchFirma();
  }, [prijave]);

  // Add this effect to handle tab changes from navigation
  useEffect(() => {
    if (location.state?.selectedTipRacuna) {
      setTabValue(location.state.selectedTipRacuna);

      const fetchInvoice = async () => {
        try {
          setApiError(null);

          reset();

          const racun = await fetchRacunById(location.state.selectedRacunId);

          setRacunData(racun);
        } catch (error) {
          console.error("Error loading invoice:", error);
          setApiError("Greška pri učitavanju podataka računa.");
        }
      };

      fetchInvoice();

      navigate("", { state: {}, replace: true });
    }
  }, [location.state?.selectedTipRacuna]);

  // --- Extract Primitives and Derived Values ---
  const seminarOnlineCena = seminar?.onlineCena;
  const seminarOfflineCena = seminar?.offlineCena;
  const seminarNaziv = seminar?.naziv;
  const seminarDatum = seminar?.datum; // Note: Date objects might still cause issues if new instances are created. Consider storing as string/timestamp if needed.
  const seminarLokacija = seminar?.lokacija;

  const firmaNaziv = firma?.naziv_firme;
  const firmaAdresa = firma?.adresa;
  const firmaPIB = firma?.PIB;
  const firmaMesto = firma?.mesto;
  const firmaMaticniBroj = firma?.maticni_broj;

  const onlineCount = prijave.filter((p) => p.prisustvo === "online").length || 0;
  const offlineCount = prijave.filter((p) => p.prisustvo === "offline").length || 0;
  // --- End Primitives Extraction ---

  useEffect(() => {
    if (seminar !== null) {
      updateNestedField("seminar.seminar_id", seminar._id || "");
      updateNestedField("seminar.onlineCena", seminarOnlineCena || 0);
      updateNestedField("seminar.offlineCena", seminarOfflineCena || 0);
      updateNestedField("seminar.naziv", seminarNaziv || "");
      updateNestedField("seminar.datum", seminarDatum || new Date());
      updateNestedField("seminar.lokacija", seminarLokacija || "");
    }

    updateNestedField("seminar.brojUcesnikaOnline", onlineCount);
    updateNestedField("seminar.brojUcesnikaOffline", offlineCount);

    if (firma !== null) {
      updateNestedField("primalacRacuna.firma_id", firma._id || "");
      updateNestedField("primalacRacuna.naziv", firmaNaziv || "");
      updateNestedField("primalacRacuna.adresa", firmaAdresa || "");
      updateNestedField("primalacRacuna.pib", firmaPIB || "");
      updateNestedField("primalacRacuna.mesto", firmaMesto || "");
      updateNestedField("primalacRacuna.maticniBroj", firmaMaticniBroj || "");
    }
  }, [
    seminarOnlineCena,
    seminarOfflineCena,
    seminarNaziv,
    seminarDatum,
    seminarLokacija,
    onlineCount,
    offlineCount,
    firmaNaziv,
    firmaAdresa,
    firmaPIB,
    firmaMesto,
    firmaMaticniBroj,
  ]);

  const handleDocxUpdate = async () => {
    setApiError(null);
    const racunData = getCompleteRacunData();
    const errors = await handlePromiseError(generateRacunDocument(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else {
      setAlertMessage("Račun uspešno sačuvan!");
      setAlertSeverity("success");
      reset();
    }
    setAlertOpen(true);
  };

  const handleSaveRacun = async () => {
    setApiError(null);
    const racunData = getCompleteRacunData();
    const errors = await handlePromiseError(saveNewRacun(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else {
      setAlertMessage("Račun uspešno sačuvan!");
      setAlertSeverity("success");
      reset();
    }
    setAlertOpen(true);
  };

  const handleUpdateRacun = async () => {
    setApiError(null);
    const racunData = getCompleteRacunData();
    const errors = await handlePromiseError(updateRacunById(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else {
      setAlertMessage("Račun uspešno ažuriran!");
      setAlertSeverity("success");
    }
    setAlertOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TipRacuna | "pretrage") => {
    resetSeminarCalculationData();
    setTabValue(newValue);
    updateField("tipRacuna", newValue);
  };

  // Function to render the appropriate form based on current tab
  const renderActiveForm = () => {
    switch (tabValue) {
      case "pretrage":
        return <PretrageRacuna />;
      case TipRacuna.PREDRACUN:
        return <CreatePredracunForm />;
      case TipRacuna.AVANSNI_RACUN:
        return <CreateAvansForm />;
      case TipRacuna.KONACNI_RACUN:
        return <CreateKonacniRacunForm />;
      default:
        return <PretrageRacuna />;
    }
  };

  useRacunCalculations();

  // Add this function to handle closing the Snackbar
  const handleAlertClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <>
      <PageTitle title={"Racuni"} />
      <IzdavacRacunaSection />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs">
          <Tab label="Pretrage" value="pretrage" />
          <Tab label="Predračun" value={TipRacuna.PREDRACUN} />
          <Tab label="Avansni račun" value={TipRacuna.AVANSNI_RACUN} />
          <Tab label="Konačni račun" value={TipRacuna.KONACNI_RACUN} />
          {/*<Tab label="Račun" value={TipRacuna.RACUN} /> */}
        </Tabs>
      </Box>

      {renderActiveForm()}

      {apiError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {apiError}
        </Alert>
      )}
      {tabValue !== "pretrage" && (
        <>
          {!racunData._id && <Button onClick={handleSaveRacun}>Sačuvaj račun</Button>}
          {racunData._id && (
            <Button onClick={handleUpdateRacun} sx={{ ml: 2 }}>
              Ažuriraj račun
            </Button>
          )}
          <Button
            sx={{ mt: 3, mb: 3 }}
            onClick={handleDocxUpdate}
            variant="contained"
            endIcon={<PostAddIcon />}
          >
            Ođe Klik
          </Button>
        </>
      )}

      <Snackbar
        open={alertOpen}
        autoHideDuration={5000} // 5 seconds
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Position
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
