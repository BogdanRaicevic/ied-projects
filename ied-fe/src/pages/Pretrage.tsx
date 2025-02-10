import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Divider from "@mui/material/Divider";
import PredefinedPretrage from "../components/PredefinedPretrage/PredefinedPretrage";
import PretragaParameters from "../components/PretragaParameters/PretragaParameters";
import ExportDataButton from "../components/SaveDataButton";
import { useState } from "react";
import { usePretragaStore } from "../store/pretragaParameters.store";
import { Box, Button } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error("Missing Publishable Key");
}

export default function Pretrage() {
	const { pretragaParameters } = usePretragaStore();

	const [appliedParameters, setAppliedParameters] =
		useState(pretragaParameters);

	const handlePretraziClick = () => {
		setAppliedParameters(pretragaParameters);
	};

	return (
		<>
			<SignedIn>
				<PageTitle title={"Pretrage"} />

				<PredefinedPretrage />

				<Divider />

				<PretragaParameters />

				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					marginBottom={4}
				>
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
			</SignedIn>
			<SignedOut>
				<h1>Morate biti prijavljeni da bi pristupili ovoj stranici</h1>
			</SignedOut>
		</>
	);
}
