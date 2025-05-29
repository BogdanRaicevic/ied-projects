import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import ExportDataButton from "../components/SaveDataButton";
import { useEffect, useState } from "react";
import { defaultPeretragaParameters, usePretragaStore } from "../store/pretragaParameters.store";
import { Box, Button } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";

export default function Pretrage() {
  const { pretragaParameters, setPretragaParameters, resetPretragaParameters } = usePretragaStore();
  const [appliedParameters, setAppliedParameters] = useState(pretragaParameters);

  useEffect(() => {
    const saved = localStorage.getItem("pretragaParameters");
    if (saved) {
      setPretragaParameters(JSON.parse(saved));
      setAppliedParameters(JSON.parse(saved)); // hydrate both
    }
  }, [setPretragaParameters]);

  const handlePretraziClick = () => {
    setAppliedParameters(pretragaParameters);
  };

  const handleReset = () => {
    resetPretragaParameters();
    setAppliedParameters(defaultPeretragaParameters);
  };

  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage onReset={handleReset} />

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
