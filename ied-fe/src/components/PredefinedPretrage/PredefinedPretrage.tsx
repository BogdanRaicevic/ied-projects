import { RestartAltOutlined } from "@mui/icons-material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import type { PretragaType } from "ied-shared";
import { useEffect, useState } from "react";
import {
  deletePretraga,
  fetchAllPretrage,
  savePretraga,
} from "../../api/pretrage.api";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import PretragaSaveDialog from "../Dialogs/PretragaSaveDialog";

export default function PredefinedPretrage() {
  const [pretrage, setPretrage] = useState<PretragaType[]>([]);

  const fetchPretrage = async () => {
    const pretrage = await fetchAllPretrage();
    setPretrage(pretrage);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is a false positive, i want to run this effect only once
  useEffect(() => {
    fetchPretrage();
  }, []);

  const [openPretrageSaveDialog, setOpenPretrageSaveDialog] = useState(false);
  const [selectedPretraga, setSelectedPretraga] = useState<{
    id: string;
    naziv: string;
  }>({
    id: "",
    naziv: "",
  });

  const handleSaveQueryParameters = async () => {
    setOpenPretrageSaveDialog(true);
  };

  const {
    pretragaParameters,
    setPretragaParameters,
    resetParameters,
    setAppliedParameters,
  } = usePretragaStore();

  const handleSavePretraga = async (nazivPretrage: string, isNew: boolean) => {
    try {
      await savePretraga(pretragaParameters, {
        naziv: isNew ? nazivPretrage : selectedPretraga.naziv,
        id: isNew ? undefined : selectedPretraga.id,
      });
      setOpenPretrageSaveDialog(false);
      await fetchPretrage();
    } catch (error) {
      // TODO: show error snackbar or toast
      console.error("Failed to save pretraga:", error);
    }
  };

  const handlePretrageSaveClose = () => setOpenPretrageSaveDialog(false);

  const handleDeletePretraga = async () => {
    if (
      window.confirm("Da li ste sigurni da zelite da obriste pretragu?") &&
      selectedPretraga
    ) {
      try {
        await deletePretraga({ id: selectedPretraga.id });
        // Optionally, you can update the state or UI to reflect the deletion
        await fetchPretrage(); // Fetch updated pretrage data
      } catch (error) {
        // TODO: show error snackbar or toast
        console.error("Failed to delete pretraga:", error);
      }
    } else {
      // TODO: show error snackbar or toast
      console.error("No option selected for deletion");
    }
  };

  const handleOptionSelect = (option: PretragaType) => {
    setSelectedPretraga({
      id: option._id ?? "",
      naziv: option.nazivPretrage ?? "",
    });
    const mappedPregrage = {
      imeFirme: option.imeFirme,
      pib: option.pib,
      email: option.email,
      mesta: option.mesta,
      delatnosti: option.delatnosti,
      tipoviFirme: option.tipoviFirme,
      radnaMesta: option.radnaMesta,
      velicineFirme: option.velicineFirme,
      negacije: option.negacije,
      stanjaFirme: option.stanjaFirme,
      jbkjs: option.jbkjs,
      maticniBroj: option.maticniBroj,
      komentar: option.komentar,
      imePrezime: option.imePrezime,
      emailZaposlenog: option.emailZaposlenog,
      firmaPrijavljeni: option.firmaPrijavljeni,
      zaposleniPrijavljeni: option.zaposleniPrijavljeni,
      tipoviSeminara: option.tipoviSeminara,
      seminari: option.seminari,
    };
    setPretragaParameters(mappedPregrage);
    setAppliedParameters();
  };

  return (
    <Grid container spacing={2} mb={2}>
      <Grid size={7}>
        <Autocomplete
          options={pretrage || []}
          getOptionLabel={(option) => option.nazivPretrage ?? ""}
          fullWidth
          renderInput={(params) => (
            <TextField {...params} label="Pretrage"></TextField>
          )}
          onChange={(_event, value) => {
            if (value) {
              handleOptionSelect(value);
            }
          }}
        />
      </Grid>
      <Grid size={5} display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={handleSaveQueryParameters}
          startIcon={<ZoomInIcon />}
        >
          Zapamti pretragu
        </Button>
        <PretragaSaveDialog
          open={openPretrageSaveDialog}
          handleClose={handlePretrageSaveClose}
          handleSave={handleSavePretraga}
          selectedPretraga={selectedPretraga}
        />
        <Button
          startIcon={<ZoomOutIcon />}
          variant="contained"
          size="large"
          color="error"
          onClick={handleDeletePretraga}
        >
          Obrisi pretragu
        </Button>
        <Button
          startIcon={<RestartAltOutlined />}
          variant="contained"
          size="large"
          color="info"
          onClick={resetParameters}
        >
          Reset
        </Button>
      </Grid>
    </Grid>
  );
}
