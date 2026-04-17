import { zodResolver } from "@hookform/resolvers/zod";
import { TipRacuna } from "ied-shared";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { getDefaultValues, type RacunV2Form } from "./schema/defaults";

type Props = {
  children: ReactNode;
  initialTipRacuna?: TipRacuna;
};

// Story 2.1 only wires RHF + resolver shell. Full discriminated Zod schema
// lands in Story 2.2.
const racunV2FormShellSchema = z.custom<RacunV2Form>(
  (value) => typeof value === "object" && value !== null,
);

export function RacunV2FormProvider({
  children,
  initialTipRacuna = TipRacuna.PREDRACUN,
}: Props) {
  const methods = useForm<RacunV2Form>({
    resolver: zodResolver(racunV2FormShellSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: getDefaultValues(initialTipRacuna),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
