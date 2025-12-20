import type { FirmaSeminarSearchParams } from "@ied-shared/types/seminar.zod";
import { Button, Grid, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { addMonths } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { useFetchPretragaData } from "../../hooks/useFetchData";
import AutocompleteMultiple from "../Autocomplete/Multiple";

export default function ParametriPretrageFirmaSeminar({
  onSubmit,
}: {
  onSubmit: (data: FirmaSeminarSearchParams) => void;
}) {
  const { delatnosti, tipoviFirme, velicineFirme } = useFetchPretragaData();

  const { control, handleSubmit, register } = useForm<FirmaSeminarSearchParams>(
    {
      defaultValues: {
        nazivFirme: "",
        nazivSeminara: "",
        tipFirme: [],
        delatnost: [],
        radnaMesta: [],
        velicineFirme: [],
        datumOd: new Date(),
        datumDo: addMonths(new Date(), 1),
        predavac: "",
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
        {/* <Grid size={3}>
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
        </Grid> */}
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
        <Grid size={3}>
          <Controller
            name="predavac"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Predavač"
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="datumOd"
            control={control}
            render={({ field }) => (
              <DatePicker
                format="yyyy/MM/dd"
                label="Startni datum"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="datumDo"
            control={control}
            render={({ field }) => (
              <DatePicker
                format="yyyy/MM/dd"
                label="Krajnji datum"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                slotProps={{ textField: { fullWidth: true } }}
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
