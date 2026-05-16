import type { RacunV2Form } from "ied-shared";
import { useFormContext } from "react-hook-form";

export const useRacunV2Form = () => useFormContext<RacunV2Form>();
