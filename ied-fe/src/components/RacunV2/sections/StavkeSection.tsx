import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { TipRacuna } from "ied-shared";
import { useFieldArray, useWatch } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";
import {
  getEmptyProizvodStavka,
  getEmptyUslugaStavka,
} from "../schema/stavkaDefaults";
import { ProizvodStavkaCard } from "./stavke/ProizvodStavkaCard";
import { UslugaStavkaCard } from "./stavke/UslugaStavkaCard";

/**
 * Container for invoice line items. Wraps `useFieldArray({ name: "stavke" })`
 * and exposes the two add buttons + per-row remove. Dispatches to
 * `UslugaStavkaCard` / `ProizvodStavkaCard` based on `tipStavke`.
 *
 * **Avansni self-guard.** The `RacunV2Form` discriminated union has
 * `stavke: z.never().optional()` on the avansni branch — that variant has
 * no line items by design (a single avans amount + rate lives directly on
 * the invoice). Layout switching in Epic 6 will conditionally render this
 * section per layout component; until then we self-guard so users can pick
 * the avansni tab without seeing nonsensical "+ Dodaj uslugu" buttons.
 *
 * Form state for `stavke` survives across tab switches (e.g.
 * predracun → konacni preserves the user's work). The cleanup of
 * out-of-band fields when crossing into avansni belongs to Epic 6.
 */
export function StavkeSection() {
  const { control, getValues } = useRacunV2Form();

  const tipRacuna = useWatch({
    control,
    name: "tipRacuna",
    defaultValue: TipRacuna.PREDRACUN,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stavke",
  });

  if (tipRacuna === TipRacuna.AVANSNI_RACUN) {
    return null;
  }

  // Snapshot defaultStopaPdv at click time. Non-reactive on purpose — once a
  // stavka is appended, its rate is independent (Story 5.2.5 / 5.3.3 expose
  // a per-stavka rate input). `getValues` returns the raw form value (the
  // schema is z.coerce.number, so it could be a string from a TextField).
  const readDefaultStopaPdv = (): number => {
    const raw = getValues("defaultStopaPdv");
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 20;
  };

  const handleAddUsluga = () => {
    append(getEmptyUslugaStavka(readDefaultStopaPdv()));
  };

  const handleAddProizvod = () => {
    append(getEmptyProizvodStavka(readDefaultStopaPdv()));
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Stavke"
        subheader="Usluge i proizvodi koji se fakturišu."
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {fields.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema stavki. Dodajte uslugu ili proizvod ispod.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {fields.map((field, index) =>
                field.tipStavke === "usluga" ? (
                  <UslugaStavkaCard
                    key={field.id}
                    stavkaIndex={index}
                    onRemove={() => remove(index)}
                  />
                ) : (
                  <ProizvodStavkaCard
                    key={field.id}
                    stavkaIndex={index}
                    onRemove={() => remove(index)}
                  />
                ),
              )}
            </Stack>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={handleAddUsluga}
              aria-label="Dodaj uslugu"
            >
              + Dodaj uslugu
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddProizvod}
              aria-label="Dodaj proizvod"
            >
              + Dodaj proizvod
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
