import Divider from "@mui/material/Divider";
import { FirmasTable } from "../components/FirmasTable/FirmasTable";
import PageTitle from "../components/PageTitle/PageTitle";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";

export default function Pretrage() {
  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage />

      <Divider />

      <PretragaParameters />

      <FirmasTable />
    </>
  );
}
