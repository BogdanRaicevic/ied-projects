import Grid from "@mui/system/Unstable_Grid";
import VirtualizedAutocomplete from "../Autocomplete/Virtualized";
import { Button } from "@mui/material";
import PretragaSaveDialog from "../Dialogs/PretragaSaveDialog";
import { useEffect, useState } from "react";
import { deletePretraga, fetchAllPretrage, savePretraga } from "../../api/pretrage.api";
import { TODO_ANY } from "../../../../ied-be/src/utils/utils";
import { usePretragaStore } from "../../store/pretragaParameters.store";

export default function PredefinedPretrage() {
  const [pretrage, setPretrage] = useState<TODO_ANY[]>([]);

  const fetchPretrage = async () => {
    const pretrage = await fetchAllPretrage();
    setPretrage(pretrage);
  };

  useEffect(() => {
    fetchPretrage();
  }, []);

  const [openPretrageSaveDialog, setOpenPretrageSaveDialog] = useState(false);
  const [selectedPretraga, setSelectedPretraga] = useState<{ id: string; naziv: string }>({
    id: "",
    naziv: "",
  });

  const handleSaveQueryParameters = async () => {
    setOpenPretrageSaveDialog(true);
  };

  const { pretragaParameters, setPretragaParameters } = usePretragaStore();

  const handleSavePretraga = async (nazivPretrage: string) => {
    const pretragaName = nazivPretrage || selectedPretraga.naziv;
    if (pretragaName) {
      try {
        await savePretraga(pretragaParameters, {
          id: nazivPretrage !== selectedPretraga.naziv ? "" : selectedPretraga.id,
          naziv: pretragaName,
        });
        setOpenPretrageSaveDialog(false);
        // Optionally, you can update the state or UI to reflect the save
        await fetchPretrage(); // Fetch updated pretrage data
      } catch (error) {
        console.error("Failed to save pretraga:", error);
      }
    } else {
      console.error("No option selected for saving");
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
        console.error("Failed to delete pretraga:", error);
      }
    } else {
      console.error("No option selected for deletion");
    }
  };

  const handleOptionSelect = (option: TODO_ANY) => {
    setSelectedPretraga({ id: option._id, naziv: option.naziv_pretrage });
    console.log("option", option);
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
    };
    setPretragaParameters(mappedPregrage);
  };

  return (
    <Grid container spacing={2} mb={2}>
      <Grid xs={8}>
        <VirtualizedAutocomplete data={pretrage || []} onOptionSelect={handleOptionSelect} />
      </Grid>
      <Grid xs={4} spacing={50}>
        <Button
          variant="contained"
          size="large"
          color="success"
          onClick={handleSaveQueryParameters}
        >
          Zapamti pretragu
        </Button>
        <PretragaSaveDialog
          open={openPretrageSaveDialog}
          handleClose={handlePretrageSaveClose}
          handleSave={handleSavePretraga}
        ></PretragaSaveDialog>
        <Button variant="contained" size="large" color="error" onClick={handleDeletePretraga}>
          Obrisi pretragu
        </Button>
      </Grid>
    </Grid>
  );
}
