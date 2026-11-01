import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import type { PretragaType } from "ied-shared";
import { Activity, useState } from "react";
import {
  useDeletePretraga,
  useSavePretraga,
} from "../../hooks/pretrage/usePretrageMutations";
import { usePretrage } from "../../hooks/pretrage/usePretrageQueries";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import PretragaSaveDialog from "../Dialogs/PretragaSaveDialog";

export default function PredefinedPretrage() {
  const { data: pretrage } = usePretrage();
  const savePretragaMutation = useSavePretraga();
  const deletePretragaMutation = useDeletePretraga();

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
      await savePretragaMutation.mutateAsync({
        queryParameters: pretragaParameters,
        pretraga: {
          naziv: isNew ? nazivPretrage : selectedPretraga.naziv,
          id: isNew ? undefined : selectedPretraga.id,
        },
      });
      setOpenPretrageSaveDialog(false);
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
        await deletePretragaMutation.mutateAsync({ id: selectedPretraga.id });
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
    const { _id, nazivPretrage, __v, ...mappedPregrage } = option as any;

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
        <Activity mode={selectedPretraga.id ? "visible" : "hidden"}>
          <Button
            startIcon={<ZoomOutIcon />}
            variant="contained"
            size="large"
            color="error"
            onClick={handleDeletePretraga}
          >
            Obrisi pretragu
          </Button>
        </Activity>
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
