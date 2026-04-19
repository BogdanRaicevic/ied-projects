import { zodResolver } from "@hookform/resolvers/zod";
import { type RacunV2Form, RacunV2Zod, TipRacuna } from "ied-shared";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { getDefaultValues } from "./schema/defaults";

type Props = {
  children: ReactNode;
  initialTipRacuna?: TipRacuna;
};

export function RacunV2FormProvider({
  children,
  initialTipRacuna = TipRacuna.PREDRACUN,
}: Props) {
  const methods = useForm<RacunV2Form>({
    resolver: zodResolver(RacunV2Zod),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: getDefaultValues(initialTipRacuna),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
