import { useFormContext } from "react-hook-form";
import type { RacunV2Form } from "../schema/defaults";

export const useRacunV2Form = () => useFormContext<RacunV2Form>();
