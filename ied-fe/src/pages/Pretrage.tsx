import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import SaveDataButton from "../components/SaveDataButton";
import { useState } from "react";
import { usePretragaStore } from "../store/pretragaParameters.store";
import { Button } from "@mui/material";

export default function Pretrage() {
  const { pretragaParameters } = usePretragaStore();

  const [appliedParameters, setAppliedParameters] = useState(pretragaParameters);

  const handlePretraziClick = () => {
    setAppliedParameters(pretragaParameters);
  };

  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage />

      <Divider />

      <PretragaParameters />

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
        variant="contained"
        sx={{ m: 1, mb: 4 }}
        size="large"
        color="info"
        onClick={handlePretraziClick}
      >
        Pretrazi
      </Button>

      <MyTable {...appliedParameters} />
    </>
  );
}
