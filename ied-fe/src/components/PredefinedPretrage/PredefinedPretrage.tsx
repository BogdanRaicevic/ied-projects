import VirtualizedAutocomplete from "../Autocomplete/Virtualized";
import { Button, Grid } from "@mui/material";
import PretragaSaveDialog from "../Dialogs/PretragaSaveDialog";
import { useEffect, useState } from "react";
import { deletePretraga, fetchAllPretrage, savePretraga } from "../../api/pretrage.api";
import type { TODO_ANY } from "../../../../ied-be/src/utils/utils";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

export default function PredefinedPretrage() {
  const [pretrage, setPretrage] = useState<TODO_ANY[]>([]);

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

  const { pretragaParameters, setPretragaParameters } = usePretragaStore();

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
    if (window.confirm("Da li ste sigurni da zelite da obriste pretragu?") && selectedPretraga) {
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

  const handleOptionSelect = (option: TODO_ANY) => {
    setSelectedPretraga({ id: option._id, naziv: option.naziv_pretrage });
    const mappedPregrage = {
      imeFirme: option.ime_firme,
      pib: option.pib,
      email: option.emali,
      mesta: option.mesta,
      delatnosti: option.delatnosti,
      tipoviFirme: option.tipovi_firme,
      radnaMesta: option.radna_mesta,
      velicineFirmi: option.velicine_firme,
      negacije: option.negacije,
      stanjaFirme: option.stanja_firme,
      jbkjs: option.jbkjs,
      maticniBroj: option.maticni_broj,
      komentar: option.komentar,
      imePrezime: option.imePrezime,
      emailZaposlenog: option.emailZaposlenog,
    };
    setPretragaParameters(mappedPregrage);
  };

  return (
    <Grid container spacing={2} mb={2}>
      <Grid size={7}>
        <VirtualizedAutocomplete data={pretrage || []} onOptionSelect={handleOptionSelect} />
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
      </Grid>
    </Grid>
  );
}
