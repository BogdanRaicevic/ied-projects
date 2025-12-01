import type { FirmaSeminarSearchParams } from "@ied-shared/types/seminar.zod";
import { Button, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useFetchPretragaData } from "../../hooks/useFetchData";
import AutocompleteMultiple from "../Autocomplete/Multiple";

export default function ParametriPretrageFirmaSeminar({
  onSubmit,
}: {
  onSubmit: (data: FirmaSeminarSearchParams) => void;
}) {
  const { delatnosti, radnaMesta, tipoviFirme, velicineFirme } =
    useFetchPretragaData();

  const { control, handleSubmit, register } = useForm<FirmaSeminarSearchParams>(
    {
      defaultValues: {
        nazivFirme: "",
        nazivSeminara: "",
        tipFirme: [],
        delatnost: [],
        radnaMesta: [],
        velicineFirme: [],
      },
    },
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid size={3}>
          <TextField
            {...register("nazivFirme")}
            fullWidth
            label="Naziv firme"
          />
        </Grid>
        <Grid size={3}>
          <TextField
            {...register("nazivSeminara")}
            fullWidth
            label="Naziv seminara"
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="tipFirme"
            control={control}
            render={({ field }) => (
              <AutocompleteMultiple
                placeholder="Tip Firme"
                data={tipoviFirme}
                checkedValues={field.value}
                onCheckedChange={field.onChange}
                id={"tip-firme"}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="delatnost"
            control={control}
            render={({ field }) => (
              <AutocompleteMultiple
                placeholder="Delatnost firme"
                data={delatnosti}
                checkedValues={field.value}
                onCheckedChange={field.onChange}
                id={"delatnost-firme"}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="radnaMesta"
            control={control}
            render={({ field }) => (
              <AutocompleteMultiple
                placeholder="Radna mesta"
                data={radnaMesta}
                checkedValues={field.value}
                onCheckedChange={field.onChange}
                id={"radna-mesta"}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="velicineFirme"
            control={control}
            render={({ field }) => (
              <AutocompleteMultiple
                placeholder="Veličina firme"
                data={velicineFirme}
                checkedValues={field.value}
                onCheckedChange={field.onChange}
                id={"velicina-firme-fs"}
              />
            )}
          />
        </Grid>
        <Button type="submit" variant="contained" color="primary">
          Pretraži
        </Button>
      </Grid>
    </form>
  );
}
