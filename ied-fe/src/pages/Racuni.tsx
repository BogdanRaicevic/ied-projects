import {
  type PrijavaZodType,
  type SeminarZodType,
  TipRacuna,
} from "@ied-shared/index";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Alert, Box, Button, Snackbar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateRacunDocument } from "../api/docx.api";
import { fetchSingleFirma } from "../api/firma.api";
import {
  fetchRacunById,
  saveNewRacun,
  updateRacunById,
} from "../api/racuni.api";
import { fetchSeminarById } from "../api/seminari.api";
import PageTitle from "../components/PageTitle";
import { CreateAvansForm } from "../components/Racun/CreateAvansForm";
import { CreateKonacniRacunForm } from "../components/Racun/CreateKonacniRacunForm";
import { CreatePredracunForm } from "../components/Racun/CreatePredracunForm";
import { CreateRacunForm } from "../components/Racun/CreateRacunForm";
import { IzdavacRacunaSection } from "../components/Racun/components/IzdavacRacunaSection";
import { useRacunCalculations } from "../components/Racun/hooks/useRacunCalculations";
import { PretrageRacuna } from "../components/Racun/PretrageRacuna";
import { useRacunStore } from "../components/Racun/store/useRacunStore";
import type { FirmaType } from "../schemas/firmaSchemas";
import handlePromiseError from "../utils/helpers";

export default function Racuni() {
  const [firma, setFirma] = useState<FirmaType | null>(null);
  const [seminar, setSeminar] = useState<SeminarZodType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null); // Keep this for persistent errors if needed
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );

  // Get store actions
  const updateNestedField = useRacunStore((state) => state.updateNestedField);
  const updateField = useRacunStore((state) => state.updateField);
  const getCompleteRacunData = useRacunStore(
    (state) => state.getCompleteRacunData,
  );
  const setRacunData = useRacunStore((state) => state.updateRacunData);
  const reset = useRacunStore((state) => state.reset);
  const resetSeminarCalculationData = useRacunStore(
    (state) => state.resetSeminarCalculationData,
  );
  const racunData = useRacunStore((state) => state.racunData);

  const location = useLocation();
  const prijave: PrijavaZodType[] = useMemo(
    () => location.state?.prijave || [],
    [location.state?.prijave],
  );
  const seminarId: string = useMemo(
    () => location.state?.seminarId || "",
    [location.state?.seminarId],
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
        setTabValue(TipRacuna.PREDRACUN);
      } catch (error) {
        console.error("Error:", error);
        setApiError("Greška pri učitavanju podataka firme ili seminara.");
      }
    };

    fetchFirma();
  }, [prijave]);

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

  // Add this useEffect to reset the store on unmount (when leaving the page)
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

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

  const onlineCount =
    prijave.filter((p) => p.prisustvo === "online").length || 0;
  const offlineCount =
    prijave.filter((p) => p.prisustvo === "offline").length || 0;
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
    const [errors] = await handlePromiseError(generateRacunDocument(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else {
      setAlertMessage("Račun uspešno sačuvan!");
      setAlertSeverity("success");
    }
    setAlertOpen(true);
  };

  const handleSaveRacun = async () => {
    setApiError(null);
    const racunData = getCompleteRacunData();
    const [errors, data] = await handlePromiseError(saveNewRacun(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else if (data) {
      setAlertMessage("Račun uspešno sačuvan!");
      setAlertSeverity("success");
      setRacunData(data);
    }
    setAlertOpen(true);
  };

  const handleUpdateRacun = async () => {
    setApiError(null);
    const racunData = getCompleteRacunData();
    const [errors, data] = await handlePromiseError(updateRacunById(racunData));

    if (errors) {
      setAlertMessage(errors);
      setAlertSeverity("error");
    } else if (data) {
      setAlertMessage("Račun uspešno ažuriran!");
      setAlertSeverity("success");
      setRacunData(data);
    }
    setAlertOpen(true);
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TipRacuna | "pretrage",
  ) => {
    setTabValue(newValue);
    updateField(
      "tipRacuna",
      newValue === "pretrage" ? TipRacuna.PREDRACUN : newValue,
    );
    if (newValue === "pretrage") {
      reset();
    } else {
      resetSeminarCalculationData();
    }
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
      case TipRacuna.RACUN:
        return <CreateRacunForm />;
      default:
        return <PretrageRacuna />;
    }
  };

  useRacunCalculations();

  // Add this function to handle closing the Snackbar
  const handleAlertClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <>
      <PageTitle title={"Racuni"} />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="basic tabs"
        >
          <Tab label="Pretrage" value="pretrage" />
          <Tab label="Predračun" value={TipRacuna.PREDRACUN} />
          <Tab label="Avansni račun" value={TipRacuna.AVANSNI_RACUN} />
          <Tab label="Konačni račun" value={TipRacuna.KONACNI_RACUN} />
          <Tab label="Račun" value={TipRacuna.RACUN} />
        </Tabs>
      </Box>

      {renderActiveForm()}
      {tabValue !== "pretrage" && <IzdavacRacunaSection />}

      {apiError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {apiError}
        </Alert>
      )}
      {tabValue !== "pretrage" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 3,
          }}
        >
          {!racunData._id && (
            <Button variant="outlined" onClick={handleSaveRacun}>
              Sačuvaj račun
            </Button>
          )}
          {racunData._id && (
            <Button variant="outlined" onClick={handleUpdateRacun}>
              Ažuriraj račun
            </Button>
          )}
          <Button
            onClick={handleDocxUpdate}
            variant="contained"
            endIcon={<PostAddIcon />}
            disabled={!racunData._id}
          >
            Ođe Klik
          </Button>
        </Box>
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
