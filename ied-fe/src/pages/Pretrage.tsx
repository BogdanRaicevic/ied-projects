import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import ExportDataButton from "../components/SaveDataButton";
import { useEffect } from "react";
import { usePretragaStore } from "../store/pretragaParameters.store";
import { Box, Button } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function Pretrage() {
  const { pretragaParameters, appliedParameters, applyParameters, loadFromStorage } =
    usePretragaStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handlePretraziClick = () => {
    applyParameters();
  };

  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage />

      <Divider />

      <PretragaParameters onSearchSubmit={handlePretraziClick} />

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Box>
          <ExportDataButton
            exportSubject="firma"
            fileName="pretrage_firma"
            queryParameters={pretragaParameters}
          />
          <ExportDataButton
            exportSubject="zaposleni"
            fileName="pretrage_zaposleni"
            queryParameters={pretragaParameters}
          />
          <Button
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="info"
            onClick={handlePretraziClick}
            startIcon={<SearchIcon />}
          >
            Pretrazi
          </Button>
        </Box>

        <Box>
          <Button
            startIcon={<AddBoxIcon />}
            href="/Firma"
            target="_blank"
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="secondary"
          >
            Dodaj Firmu
          </Button>
        </Box>
      </Box>
      <MyTable {...appliedParameters} />
    </>
  );
}
