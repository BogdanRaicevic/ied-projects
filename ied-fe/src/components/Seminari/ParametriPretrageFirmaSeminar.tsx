import type { FirmaSeminarSearchParams } from "@ied-shared/types/seminar.zod";
import { UnfoldLess } from "@mui/icons-material";
import { Box, Button, FormControl, Grid, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { addMonths } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import {
  useFetchPretragaData,
  useFetchTipoviSeminara,
} from "../../hooks/useFetchData";
import AutocompleteMultiple from "../Autocomplete/Multiple";
import MultiSelectAutocomplete from "../Autocomplete/MultiSelectAutocomplete";

export default function ParametriPretrageFirmaSeminar({
  onSubmit,
}: {
  onSubmit: (data: FirmaSeminarSearchParams) => void;
}) {
  const { delatnosti, tipoviFirme, velicineFirme } = useFetchPretragaData();
  const { data: tipoviSeminara, isLoading } = useFetchTipoviSeminara();

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
        <Grid size={9} columns={12} container spacing={3}>
          <Grid size={4}>
            <TextField
              {...register("nazivFirme")}
              fullWidth
              label="Naziv firme"
            />
          </Grid>
          <Grid size={4}>
            <TextField
              {...register("nazivSeminara")}
              fullWidth
              label="Naziv seminara"
            />
          </Grid>
          <Grid size={4}>
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
          <Grid size={4}>
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
          {/* <Grid size={4}>
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
          <Grid size={4}>
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
          <Grid size={4}>
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
          <Grid size={4}>
            <Controller
              name="tipSeminara"
              control={control}
              render={({ field }) => (
                <MultiSelectAutocomplete
                  labelKey={"tipSeminara" as any}
                  options={tipoviSeminara || []}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  inputLabel="Tip seminara"
                  inputPlaceholder={
                    isLoading ? "Učitavanje..." : "Izaberite tipove seminara"
                  }
                />
              )}
            />
          </Grid>
        </Grid>

        <Grid size={3} columns={12} container>
          <FormControl fullWidth>
            <Controller
              name="datumOd"
              control={control}
              render={({ field }) => (
                <DatePicker
                  format="yyyy/MM/dd"
                  label="Startni datum seminara"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
            <Box display="flex" alignItems="center" justifyContent="center">
              <UnfoldLess />
            </Box>
            <Controller
              name="datumDo"
              control={control}
              render={({ field }) => (
                <DatePicker
                  format="yyyy/MM/dd"
                  label="Krajnji datum seminara"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={12} sx={{ mb: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Pretraži
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
