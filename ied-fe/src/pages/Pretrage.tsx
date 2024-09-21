import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import SaveDataButton from "../components/SaveDataButton";
import { useState } from "react";
import { usePretragaStore } from "../store/pretragaParameters.store";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Pretrage() {
  const { pretragaParameters } = usePretragaStore();

  const [appliedParameters, setAppliedParameters] = useState(pretragaParameters);

  const handlePretraziClick = () => {
    setAppliedParameters(pretragaParameters);
  };

  const navigate = useNavigate();
  const handleDodajFirmu = () => {
    navigate("/Firma");
  };

  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage />

      <Divider />

      <PretragaParameters />

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Box>
          <SaveDataButton
            exportSubject="firma"
            fileName="pretrage_firma"
            queryParameters={pretragaParameters}
          ></SaveDataButton>
          <SaveDataButton
            exportSubject="zaposleni"
            fileName="pretrage_zaposleni"
            queryParameters={pretragaParameters}
          ></SaveDataButton>
          <Button
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="info"
            onClick={handlePretraziClick}
          >
            Pretrazi
          </Button>
        </Box>

        <Box>
          <Button
            onClick={handleDodajFirmu}
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
