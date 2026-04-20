import { RacunV2Content } from "../components/RacunV2/RacunV2Content";
import { RacunV2FormProvider } from "../components/RacunV2/RacunV2FormProvider";

export default function RacuniV2() {
  return (
    <RacunV2FormProvider>
      <RacunV2Content />
    </RacunV2FormProvider>
  );
}
