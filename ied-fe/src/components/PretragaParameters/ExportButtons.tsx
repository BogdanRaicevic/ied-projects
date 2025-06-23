import { Control, useWatch } from "react-hook-form";
import ExportDataButton from "../SaveDataButton";

export function ExportButtons({ control }: { control: Control }) {
	const formValues = useWatch({ control }); // Only this component re-renders on change

	return (
		<>
			<ExportDataButton
				exportSubject="firma"
				fileName="pretrage_firma"
				queryParameters={formValues}
			/>
			<ExportDataButton
				exportSubject="zaposleni"
				fileName="pretrage_zaposleni"
				queryParameters={formValues}
			/>
		</>
	);
}
