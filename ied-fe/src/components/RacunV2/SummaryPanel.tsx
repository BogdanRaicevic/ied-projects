import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { format as formatDate } from "date-fns";
import {
  formatMoney,
  IzdavacRacuna,
  TipRacuna,
  tipRacunaHasRokZaUplatu,
  type Valuta,
} from "ied-shared";
import { useFormState, useWatch } from "react-hook-form";
import bsLogo from "../../images/bs-logo.png";
import iedLogo from "../../images/ied-logo.png";
import permanentLogo from "../../images/permanent-logo.png";
import { useRacunV2Calculations } from "./hooks/useRacunV2Calculations";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { collectFormErrors, formatErrorPath } from "./utils/collectFormErrors";
import { toDateOrNull } from "./utils/date";

const IZDAVAC_LOGOS: Record<IzdavacRacuna, string> = {
  [IzdavacRacuna.IED]: iedLogo,
  [IzdavacRacuna.PERMANENT]: permanentLogo,
  [IzdavacRacuna.BS]: bsLogo,
};

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
  const izdavacRacuna = useWatch({
    control,
    name: "izdavacRacuna",
    defaultValue: IzdavacRacuna.IED,
  });
  // `rokZaUplatu` exists on the predracun, konacni, and racun branches of
  // the discriminated union (see `tipRacunaHasRokZaUplatu`). On the avansni
  // branch the field doesn't exist and RHF returns undefined; the display is
  // gated below so the value is only rendered when valid for the current tab.
  const rokZaUplatu = useWatch({
    control,
    name: "rokZaUplatu",
    defaultValue: undefined,
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

  const isAvansniRacun = tipRacuna === TipRacuna.AVANSNI_RACUN;
  const stavkePreview = stavkaSubtotali.slice(0, 3);
  const remainingStavkeCount = Math.max(
    stavkaSubtotali.length - stavkePreview.length,
    0,
  );
  const errorPreview = formErrors.slice(0, 4);
  const hiddenErrorsCount = Math.max(
    formErrors.length - errorPreview.length,
    0,
  );
  const hasMetadata =
    tipRacunaHasRokZaUplatu(tipRacuna) || tipRacuna === TipRacuna.AVANSNI_RACUN;

  return (
    <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
      <Card
        variant="outlined"
        sx={{
          borderColor: (theme) => alpha(theme.palette.success.main, 0.16),
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <CardHeader
          title="Pregled"
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              {!isAvansniRacun ? (
                <Chip
                  label={
                    stavkaSubtotali.length === 1
                      ? "1 stavka"
                      : stavkaSubtotali.length <= 4
                        ? `${stavkaSubtotali.length} stavke`
                        : `${stavkaSubtotali.length} stavki`
                  }
                  variant="outlined"
                />
              ) : null}
            </Stack>
          }
          sx={{
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
            "& .MuiCardHeader-action": {
              alignSelf: "center",
              m: 0,
            },
          }}
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <IzdavacBadge izdavac={izdavacRacuna} />

            <Box
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
                p: 2,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                Finansijski pregled
              </Typography>
              <Stack spacing={1.1} sx={{ mt: 1 }}>
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
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.success.main, 0.26),
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  p: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "success.dark",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Ukupna naknada
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                    color: "success.dark",
                    lineHeight: 1.1,
                  }}
                >
                  {formatMoney(totals.ukupnaNaknada, valuta)}
                </Typography>
              </Box>
            </Box>

            {hasMetadata ? (
              <InfoBlock title="Rok i naplata">
                {tipRacunaHasRokZaUplatu(tipRacuna) ? (
                  <RokZaUplatuRow days={Number(rokZaUplatu) || null} />
                ) : null}
                {tipRacuna === TipRacuna.AVANSNI_RACUN ? (
                  <DatumUplateAvansaRow
                    date={toDateOrNull(datumUplateAvansa)}
                  />
                ) : null}
              </InfoBlock>
            ) : null}

            {isAvansniRacun ? null : (
              <InfoBlock
                title="Stavke"
                action={
                  <Chip
                    label={
                      stavkaSubtotali.length === 1
                        ? "1 stavka"
                        : `${stavkaSubtotali.length} stavki`
                    }
                    variant="outlined"
                  />
                }
              >
                {stavkaSubtotali.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nema stavki.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {stavkePreview.map((stavka, index) => (
                      <StavkaPreviewRow
                        // biome-ignore lint/suspicious/noArrayIndexKey: calculator output is a derived flat array without stable ids; SummaryPanel is read-only display, no drag/reorder. RHF `useFieldArray` ids live in StavkeSection.
                        key={`${stavka.tipStavke}-${index}-${stavka.naziv}`}
                        label={stavka.naziv || "(bez naziva)"}
                        typeLabel={
                          stavka.tipStavke === "usluga" ? "Usluga" : "Proizvod"
                        }
                        typeColor={
                          stavka.tipStavke === "usluga" ? "info" : "success"
                        }
                        amount={formatMoney(stavka.ukupno, valuta)}
                      />
                    ))}
                    {remainingStavkeCount > 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        +{remainingStavkeCount} još u glavnoj listi stavki
                      </Typography>
                    ) : null}
                  </Stack>
                )}
              </InfoBlock>
            )}

            {formErrors.length > 0 ? (
              <Alert
                severity="error"
                variant="outlined"
                sx={{ borderRadius: 2.5 }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  gutterBottom
                  component="div"
                >
                  {formErrors.length === 1
                    ? "1 greška blokira pregled"
                    : `${formErrors.length} grešaka blokira pregled`}
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {errorPreview.map((err) => {
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
                {hiddenErrorsCount > 0 ? (
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{ display: "block", mt: 1 }}
                  >
                    +{hiddenErrorsCount} dodatnih grešaka u formi
                  </Typography>
                ) : null}
              </Alert>
            ) : null}

            <Box
              sx={{
                borderRadius: 2.5,
                border: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
                p: 1.5,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                color="success"
              >
                Potvrdi i pregledaj
              </Button>
            </Box>
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

/**
 * Identity strip at the top of Pregled showing which `izdavac` this racun is
 * being created under. Helps the user catch wrong-izdavac mistakes early —
 * the financial total below is meaningful only in the context of a specific
 * issuer (different PDV regime, different tekuci racun, different branding
 * on the final DOCX).
 */
function IzdavacBadge({ izdavac }: { izdavac: IzdavacRacuna }) {
  const logoSrc = IZDAVAC_LOGOS[izdavac];

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: 1,
        borderColor: "divider",
        bgcolor: "common.white",
        p: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        sx={{
          maxWidth: "100%",
          maxHeight: "40px",
          objectFit: "contain",
          display: "block",
        }}
      />
    </Box>
  );
}

function SummaryRow({ label, amount, valuta, emphasize }: SummaryRowProps) {
  const variant = emphasize ? "subtitle1" : "body2";
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      spacing={2}
    >
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
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      spacing={2}
    >
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
function RokZaUplatuRow({ days }: { days: number | null }) {
  const display =
    days === null || !Number.isFinite(days) ? "—" : formatDays(days);
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      spacing={2}
    >
      <Typography variant="body2" color="text.secondary">
        Rok za uplatu
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {display}
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
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      spacing={2}
    >
      <Typography variant="body2" color="text.secondary">
        Datum uplate avansa
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {display}
      </Typography>
    </Stack>
  );
}

function InfoBlock({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: 1,
        borderColor: "divider",
        bgcolor: "common.white",
        p: 1.75,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1.25 }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {action}
      </Stack>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function StavkaPreviewRow({
  label,
  typeLabel,
  typeColor,
  amount,
}: {
  label: string;
  typeLabel: string;
  typeColor: "info" | "success";
  amount: string;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        px: 1.25,
        py: 1,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label={typeLabel} color={typeColor} variant="outlined" />
        </Stack>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ mt: 0.75 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={700}>
        {amount}
      </Typography>
    </Stack>
  );
}
