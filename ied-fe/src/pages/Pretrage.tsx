import Divider from "@mui/material/Divider";
import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import { env } from "../utils/envVariables";

const PUBLISHABLE_KEY = env.clerkPublishableKey;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function Pretrage() {
  return (
    <>
      <PageTitle title={"Pretrage"} />

      <PredefinedPretrage />

      <Divider />

      <PretragaParameters />

      <MyTable />
    </>
  );
}
