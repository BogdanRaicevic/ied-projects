import Grid from "@mui/system/Unstable_Grid";
import VirtualizedAutocomplete from "../VritualizedAutocomplete/VirtualizedAutocomplete";
import { Button } from "@mui/material";
import PretragaSaveDialog from "../Dialogs/PretragaSaveDialog";
import { useEffect, useState } from "react";
import { deletePretraga, fetchAllPretrage, savePretraga } from "../../api/pretrage.api";
import { TODO_ANY } from "../../../../ied-be/src/utils/utils";

export default function PredefinedPretrage({
  onOptionSelect,
  queryParameters,
}: {
  onOptionSelect: (option: TODO_ANY) => void;
  queryParameters: {
    imeFirme: string;
    pib: string;
    email: string;
    velicineFirmi: string[];
    radnaMesta: string[];
    tipoviFirme: string[];
    delatnosti: string[];
    mesta: string[];
    negacije: string[];
  };
}) {
  const [pretrage, setPretrage] = useState<TODO_ANY[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const predefinedPretrage = await fetchAllPretrage();
      setPretrage(predefinedPretrage);
    };

    fetchData();
  }, []);

  const fetchUpdatedPretrage = async () => {
    const updatedPretrage = await fetchAllPretrage();
    setPretrage(updatedPretrage);
  };

  const [openPretrageSaveDialog, setOpenPretrageSaveDialog] = useState(false);
  const [selectedPretraga, setSelectedPretraga] = useState<{ id: string; naziv: string }>({
    id: "",
    naziv: "",
  });

  const handleSaveQueryParameters = async () => {
    setOpenPretrageSaveDialog(true);
  };

  const handleSavePretraga = async (nazivPretrage: string) => {
    const pretragaName = nazivPretrage || selectedPretraga.naziv;
    if (pretragaName) {
      try {
        await savePretraga(queryParameters, {
          id: nazivPretrage !== selectedPretraga.naziv ? "" : selectedPretraga.id,
          naziv: pretragaName,
        });
        setOpenPretrageSaveDialog(false);
        // Optionally, you can update the state or UI to reflect the save
        await fetchUpdatedPretrage(); // Fetch updated pretrage data
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
        await fetchUpdatedPretrage(); // Fetch updated pretrage data
      } catch (error) {
        console.error("Failed to delete pretraga:", error);
      }
    } else {
      console.error("No option selected for deletion");
    }
  };

  const handleOptionSelect = (option: TODO_ANY) => {
    setSelectedPretraga({ id: option._id, naziv: option.naziv_pretrage });
    onOptionSelect(option);
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
