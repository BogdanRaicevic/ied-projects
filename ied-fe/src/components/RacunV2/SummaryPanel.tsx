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
import { formatMoney, type Valuta } from "ied-shared";
import { useFormState, useWatch } from "react-hook-form";
import { useRacunV2Calculations } from "./hooks/useRacunV2Calculations";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import {
  collectFormErrors,
  formatErrorPath,
} from "./utils/collectFormErrors";

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
              <Divider />
              <SummaryRow
                label="Ukupna naknada"
                amount={totals.ukupnaNaknada}
                valuta={valuta}
                emphasize
              />
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
