import { zodResolver } from "@hookform/resolvers/zod";
import {
  type IzdavacRacuna,
  type RacunV2Form,
  RacunV2Zod,
  TipRacuna,
} from "ied-shared";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { RacunV2SeminariPrefill } from "./schema/buildPrefillFromSeminari";
import { getDefaultValues } from "./schema/defaults";

type Props = {
  children: ReactNode;
  izdavacRacuna: IzdavacRacuna;
  initialTipRacuna?: TipRacuna;
  initialPrefill?: RacunV2SeminariPrefill;
};

export function RacunV2FormProvider({
  children,
  izdavacRacuna,
  initialTipRacuna = TipRacuna.PREDRACUN,
  initialPrefill,
}: Props) {
  const methods = useForm<RacunV2Form>({
    resolver: zodResolver(RacunV2Zod),
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: getDefaultValues(
      initialTipRacuna,
      izdavacRacuna,
      initialPrefill,
    ),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
