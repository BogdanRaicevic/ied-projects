import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { PrimalacRacunaV2Form } from "ied-shared";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";

type TipPrimaoca = PrimalacRacunaV2Form["tipPrimaoca"];

/**
 * Builds a fresh primalac subtree for the target tip. All user-editable fields
 * are reset to empty strings — switching tip is treated as "start over". Per
 * the schema, the firma branch and the fizicko branch share zero user fields
 * by name (`nazivFirme` vs `imeIPrezime`, `pib`/`maticniBroj`/`firma_id` vs
 * `jmbg`), so there is nothing to carry over even if we wanted to.
 */
const buildEmptyPrimalac = (nextTip: TipPrimaoca): PrimalacRacunaV2Form => {
  if (nextTip === "firma") {
    return {
      tipPrimaoca: "firma",
      firma_id: "",
      naziv: "",
      pib: "",
      maticniBroj: "",
      adresa: "",
      mesto: "",
    };
  }

  return {
    tipPrimaoca: "fizicko",
    imeIPrezime: "",
    adresa: "",
    mesto: "",
    jmbg: "",
  };
};

/**
 * Value-based check: does the user have any non-empty primalac field right
 * now? Used to decide whether switching tip needs a confirm dialog.
 *
 * Intentionally NOT based on RHF's `dirtyFields`: when we replace the
 * `primalacRacuna` subtree across a discriminated union, RHF computes per-key
 * dirty against the OLD branch's defaults (which have different keys), so
 * keys exclusive to the new branch end up dirty=true even when empty.
 * Value-based check is immune to that and is what we actually mean to ask.
 */
const hasPrimalacContent = (current: PrimalacRacunaV2Form): boolean => {
  return Object.entries(current).some(
    ([key, value]) =>
      key !== "tipPrimaoca" &&
      typeof value === "string" &&
      value.trim() !== "",
  );
};

export function PrimalacRacunaSection() {
  const { control, getValues, setValue } = useRacunV2Form();

  const tipPrimaoca = useWatch({
    control,
    name: "primalacRacuna.tipPrimaoca",
    defaultValue: "firma",
  });

  const [pendingTip, setPendingTip] = useState<TipPrimaoca | null>(null);

  const applySwitch = (nextTip: TipPrimaoca) => {
    setValue("primalacRacuna", buildEmptyPrimalac(nextTip), {
      shouldValidate: false,
    });
  };

  const handleTipChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextValue: TipPrimaoca | null,
  ) => {
    if (!nextValue || nextValue === tipPrimaoca) return;

    const current = getValues("primalacRacuna");
    if (hasPrimalacContent(current)) {
      setPendingTip(nextValue);
      return;
    }

    applySwitch(nextValue);
  };

  const handleConfirmSwitch = () => {
    if (!pendingTip) return;
    applySwitch(pendingTip);
    setPendingTip(null);
  };

  const handleCancelSwitch = () => setPendingTip(null);

  return (
    <Card variant="outlined">
      <CardHeader
        title="Primalac računa"
        subheader="Podaci o primaocu — pravno ili fizičko lice."
      />
      <Divider />
      <CardContent>
        <Stack spacing={2.5}>
          <ToggleButtonGroup
            value={tipPrimaoca}
            exclusive
            color="primary"
            onChange={handleTipChange}
            aria-label="Tip primaoca"
            size="small"
          >
            <ToggleButton value="firma" aria-label="Firma">
              Firma
            </ToggleButton>
            <ToggleButton value="fizicko" aria-label="Fizičko lice">
              Fizičko lice
            </ToggleButton>
          </ToggleButtonGroup>

          {tipPrimaoca === "firma" ? (
            <FirmaFields />
          ) : (
            <FizickoLiceFields />
          )}
        </Stack>
      </CardContent>

      <Dialog
        open={pendingTip !== null}
        onClose={handleCancelSwitch}
        aria-labelledby="primalac-switch-confirm-title"
      >
        <DialogTitle id="primalac-switch-confirm-title">
          Promena tipa primaoca
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sva polja primaoca će biti resetovana. Nastaviti?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSwitch}>Odustani</Button>
          <Button
            onClick={handleConfirmSwitch}
            color="primary"
            variant="contained"
            autoFocus
          >
            Nastavi
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function FirmaFields() {
  const { control } = useRacunV2Form();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="primalacRacuna.naziv"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              label="Naziv firme"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="primalacRacuna.pib"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              label="PIB"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="primalacRacuna.maticniBroj"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              label="Matični broj"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Controller
          name="primalacRacuna.adresa"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="Adresa"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name="primalacRacuna.mesto"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="Mesto"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

function FizickoLiceFields() {
  const { control } = useRacunV2Form();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="primalacRacuna.imeIPrezime"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              label="Ime i prezime"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Controller
          name="primalacRacuna.adresa"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              required
              label="Adresa"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name="primalacRacuna.mesto"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="Mesto"
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="primalacRacuna.jmbg"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="JMBG"
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                "Unosi se za račune iznad zakonskog praga."
              }
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
