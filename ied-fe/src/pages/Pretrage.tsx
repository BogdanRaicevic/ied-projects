import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
