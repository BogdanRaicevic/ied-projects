import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { format as formatDate } from "date-fns";
import {
  formatMoney,
  TipRacuna,
  tipRacunaHasRokZaUplatu,
  type Valuta,
} from "ied-shared";
import { useFormState, useWatch } from "react-hook-form";
import { useRacunV2Calculations } from "./hooks/useRacunV2Calculations";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { collectFormErrors, formatErrorPath } from "./utils/collectFormErrors";
import { toDateOrNull } from "./utils/date";

/**
 * Sticky right-column summary for RacunV2. Reads totals + per-stavka
 * subtotals from `useRacunV2Calculations` (which subscribes to RHF state via
 * `watch`), so it re-renders live as the user types.
 *
 * The CTA is a `type="submit"` button — the wrapping `<form>` lives in
 * `RacunV2Content`. Clicking it triggers RHF's `handleSubmit`, which sets
 * `formState.isSubmitting` and disables the button. The actual submit
 * payload + navigation are wired in Epic 8.
 *
 * Sticky behavior is set on the panel root; the parent in `RacunV2Content`
 * is a Grid that wraps below the `md` breakpoint, so on narrow screens the
 * panel naturally falls under the form sections and sticky becomes a no-op.
 */
export function SummaryPanel() {
  const { control } = useRacunV2Form();
  const { errors, isSubmitting } = useFormState({ control });
  const valuta = useWatch({
    control,
    name: "valuta",
    defaultValue: "RSD",
  }) as Valuta;
  const tipRacuna = useWatch({
    control,
    name: "tipRacuna",
    defaultValue: TipRacuna.PREDRACUN,
  });
  // `rokZaUplatu` exists on the predracun, konacni, and racun branches of
  // the discriminated union (see `tipRacunaHasRokZaUplatu`). On the avansni
  // branch the field doesn't exist and RHF returns undefined; the display is
  // gated below so the value is only rendered when valid for the current tab.
  const rokZaUplatu = useWatch({
    control,
    name: "rokZaUplatu",
    defaultValue: 0,
  });
  // `datumUplateAvansa` exists only on the avansni branch. Mirror is gated
  // on `tipRacuna === AVANSNI_RACUN` below; on other branches RHF returns
  // undefined (which `toDateOrNull` collapses to `null` → renders the
  // dash placeholder, but it's never actually mounted off-tab).
  const datumUplateAvansa = useWatch({
    control,
    name: "datumUplateAvansa",
    defaultValue: null,
  });
  const { totals, stavkaSubtotali } = useRacunV2Calculations();

  const formErrors = collectFormErrors(errors);

  return (
    <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
      <Card variant="outlined">
        <CardHeader
          title="Pregled"
          subheader="Totali se ažuriraju u realnom vremenu."
        />
        <Divider />
        <CardContent>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <SummaryRow
                label="Ukupna poreska osnovica"
                amount={totals.ukupnaPoreskaOsnovica}
                valuta={valuta}
              />
              <SummaryRow
                label="Ukupan PDV"
                amount={totals.ukupanPdv}
                valuta={valuta}
              />
              {tipRacuna === TipRacuna.KONACNI_RACUN ? (
                <DeductionRow
                  label="Avans"
                  amount={totals.odbitak}
                  valuta={valuta}
                />
              ) : null}
              <Divider />
              <SummaryRow
                label="Ukupna naknada"
                amount={totals.ukupnaNaknada}
                valuta={valuta}
                emphasize
              />
              {tipRacunaHasRokZaUplatu(tipRacuna) ? (
                <RokZaUplatuRow days={Number(rokZaUplatu) || 0} />
              ) : null}
              {tipRacuna === TipRacuna.AVANSNI_RACUN ? (
                <DatumUplateAvansaRow date={toDateOrNull(datumUplateAvansa)} />
              ) : null}
            </Stack>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Stavke
              </Typography>
              {stavkaSubtotali.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nema stavki.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {stavkaSubtotali.map((stavka, index) => (
                    <ListItem
                      // biome-ignore lint/suspicious/noArrayIndexKey: calculator output is a derived flat array without stable ids; SummaryPanel is read-only display, no drag/reorder. RHF `useFieldArray` ids live in StavkeSection (Epic 5).
                      key={`${stavka.tipStavke}-${index}-${stavka.naziv}`}
                      disableGutters
                      sx={{ py: 0.5 }}
                    >
                      <ListItemText
                        primary={stavka.naziv || "(bez naziva)"}
                        secondary={`${stavka.tipStavke === "usluga" ? "Usluga" : "Proizvod"} · PDV ${stavka.stopaPdv}%`}
                        slotProps={{
                          primary: {
                            variant: "body2",
                          },
                          secondary: {
                            variant: "caption",
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {formatMoney(stavka.ukupno, valuta)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {formErrors.length > 0 ? (
              <Alert severity="error" variant="outlined">
                <Typography
                  variant="body2"
                  fontWeight={600}
                  gutterBottom
                  component="div"
                >
                  {formErrors.length === 1
                    ? "1 greška u formi:"
                    : `${formErrors.length} grešaka u formi:`}
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    pl: 2.5,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {formErrors.map((err) => {
                    const label = formatErrorPath(err.path);
                    return (
                      <Typography
                        key={err.path.join(".")}
                        component="li"
                        variant="caption"
                        sx={{ display: "list-item" }}
                      >
                        <strong>{label}</strong>
                        {err.message ? `: ${err.message}` : null}
                      </Typography>
                    );
                  })}
                </Box>
              </Alert>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              Potvrdi i pregledaj
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

type SummaryRowProps = {
  label: string;
  amount: number;
  valuta: Valuta;
  emphasize?: boolean;
};

function SummaryRow({ label, amount, valuta, emphasize }: SummaryRowProps) {
  const variant = emphasize ? "subtitle1" : "body2";
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography
        variant={variant}
        color={emphasize ? "text.primary" : "text.secondary"}
        fontWeight={emphasize ? 600 : 400}
      >
        {label}
      </Typography>
      <Typography variant={variant} fontWeight={emphasize ? 700 : 500}>
        {formatMoney(amount, valuta)}
      </Typography>
    </Stack>
  );
}

/**
 * Deduction row used by konacni's `− Avans` line (Phase 1: stub returns 0;
 * Phase 3 wires real linked-avansni data through the same `totals.odbitak`).
 *
 * Renders the value with an explicit minus prefix so the visual reads as a
 * subtraction even when the value is 0,00 ("−0,00 RSD" makes intent obvious
 * — it's the slot the avans will land in once Phase 3 ships). The math
 * displayed in Pregled stays honest: `osnovica + pdv − odbitak` equals the
 * `Ukupna naknada` row directly below.
 *
 * Same component will work for racun's `− Plaćeno` row in Story 6.4.
 */
type DeductionRowProps = {
  label: string;
  amount: number;
  valuta: Valuta;
};

function DeductionRow({ label, amount, valuta }: DeductionRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {`- ${formatMoney(amount, valuta)}`}
      </Typography>
    </Stack>
  );
}

/**
 * Read-only display of `rokZaUplatu` (Predracun, Konacni racun, Racun —
 * see `tipRacunaHasRokZaUplatu`). The editable input is the source of
 * truth in `UsloviPlacanjaSection`; this row is a sticky mirror so the
 * user can see the current term while typing in stavke without scrolling.
 * Singular/plural Serbian inflection: 1 dan, 2+ dana.
 */
function RokZaUplatuRow({ days }: { days: number }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant="body2" color="text.secondary">
        Rok za uplatu
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {formatDays(days)}
      </Typography>
    </Stack>
  );
}

/**
 * Serbian plural rules (cardinal): 1 → "dan", 2-4 → "dana", everything else
 * → "dana". (5+, 0, and the teens 11-14 also take "dana".) Implementation
 * checks the last two digits to handle teens correctly.
 */
const formatDays = (n: number): string => {
  const safe = Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  const useDan = safe === 1;
  return `${safe} ${useDan ? "dan" : "dana"}`;
};

/**
 * Read-only display of `datumUplateAvansa` (avansni only). Source of truth
 * is the DatePicker inside `AvansAmountsSection`; this row mirrors the
 * value under "Ukupna naknada", same slot the rok-za-uplatu mirror uses on
 * the other tabs (the two are mutually exclusive — avansni doesn't have
 * `rokZaUplatu`, the others don't have `datumUplateAvansa`).
 *
 * Format `yyyy.MM.dd` matches the DatePicker input format. When the user
 * hasn't picked a date yet, renders "—" so the row is always present
 * (avoids layout shift when the value lands).
 */
function DatumUplateAvansaRow({ date }: { date: Date | null }) {
  const display = date ? formatDate(date, "yyyy.MM.dd") : "—";
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant="body2" color="text.secondary">
        Datum uplate avansa
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {display}
      </Typography>
    </Stack>
  );
}
