import { useState } from "react";
import SeminarForm from "../components/Seminari/SeminarForm";
import SeminariTable from "../components/Seminari/SeminariTable";
import { SeminarQueryParams } from "@ied-shared/types/seminar.zod";
import { ParametriPretrageSeminar } from "../components/Seminari/ParametriPretrageSeminar";
import { addMonths, subMonths } from "date-fns";

export default function Seminari() {
	const [seminariUpdateCounter, setSeminarUpdateCounter] = useState(0);
	const [tableInputParameters, setTableInputParameters] =
		useState<SeminarQueryParams>({
			naziv: "",
			predavac: "",
			lokacija: "",
			datumOd: subMonths(new Date(), 3),
			datumDo: addMonths(new Date(), 3),
		});

	const handleSeminarUpdate = () => {
		setSeminarUpdateCounter((prev) => prev + 1);
	};

	const handlePretraziSeminare = (values: SeminarQueryParams) => {
		setTableInputParameters(values);
	};

	return (
		<>
			<ParametriPretrageSeminar onSubmit={handlePretraziSeminare} />

			<SeminariTable
				queryParameters={tableInputParameters}
				updateCounter={seminariUpdateCounter}
			/>

			<SeminarForm onSuccess={handleSeminarUpdate} />
		</>
	);
}
