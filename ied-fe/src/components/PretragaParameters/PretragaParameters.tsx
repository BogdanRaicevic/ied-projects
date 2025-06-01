import { Box, Button, Chip, Grid, TextField } from "@mui/material";
import AutocompleteMultiple from "../Autocomplete/Multiple";
import CheckboxList from "../CheckboxList";
import NegationCheckbox from "../NegationCheckbox";
import { defaultPretrageParameters, usePretragaStore } from "../../store/pretragaParameters.store";
import { useFetchData } from "../../hooks/useFetchData";
import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { format } from "date-fns";
import { useEffect } from "react";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import { Controller, useForm } from "react-hook-form";
import { ExportButtons } from "./ExportButtons";

export default function PretragaParameters() {
  const { delatnosti, mesta, radnaMesta, tipoviFirme, velicineFirme, stanjaFirme, sviSeminari } =
    useFetchData();

  const {
    setPretragaParameters,
    setPaginationParameters,
    setAppliedParameters: applyParameters,
    appliedParameters,
    loadFromStorage,
  } = usePretragaStore();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: defaultPretrageParameters as FirmaQueryParams,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Effect to update the form when storePretragaParameters changes (e.g., after loading from localStorage)
  useEffect(() => {
    reset(appliedParameters);
  }, [appliedParameters, reset]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        // Prevent default form submission if this component is part of a <form>
        // event.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSubmit]);

  const onSubmit = (data: FirmaQueryParams) => {
    setPretragaParameters(data);
    setPaginationParameters({ pageIndex: 0, pageSize: 50 });
    applyParameters();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} marginTop={2}>
        <Grid size={8}>
          <Grid container direction="column" gap={2}>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <Controller
                  name="radnaMesta"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteMultiple
                      data={radnaMesta}
                      onCheckedChange={field.onChange}
                      placeholder="Radno Mesto"
                      id="radno-mesto"
                      key="autocomplete-radno-mesto"
                      checkedValues={field.value || []}
                    />
                  )}
                />
              </Grid>
              <Grid px={2} size={2}>
                <Controller
                  name="negacije"
                  control={control}
                  render={({ field }) => (
                    <NegationCheckbox
                      key="negate-radno-mesto"
                      value="negate-radno-mesto"
                      negationChecked={field.value?.includes("negate-radno-mesto") || false}
                      onNegationChange={(val) => {
                        // Toggle logic for negation
                        if (field.value?.includes(val)) {
                          field.onChange(field.value.filter((v: string) => v !== val));
                        } else {
                          field.onChange([...(field.value || []), val]);
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <Controller
                  name="tipoviFirme"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteMultiple
                      data={tipoviFirme}
                      onCheckedChange={field.onChange}
                      placeholder="Tip Firme"
                      id="tip-firme"
                      key="autocomplete-tip-firme"
                      checkedValues={field.value || []}
                    />
                  )}
                />
              </Grid>
              <Grid px={2} size={2}>
                <Controller
                  name="negacije"
                  control={control}
                  render={({ field }) => (
                    <NegationCheckbox
                      key="negate-tip-firme"
                      value="negate-tip-firme"
                      negationChecked={field.value?.includes("negate-tip-firme") || false}
                      onNegationChange={(val) => {
                        if (field.value?.includes(val)) {
                          field.onChange(field.value.filter((v: string) => v !== val));
                        } else {
                          field.onChange([...(field.value || []), val]);
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <Controller
                  name="delatnosti"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteMultiple
                      data={delatnosti}
                      onCheckedChange={field.onChange}
                      placeholder="Delatnost"
                      id="delatnost"
                      key="autocomplete-delatnost"
                      checkedValues={field.value || []}
                    />
                  )}
                />
              </Grid>
              <Grid px={2} size={2}>
                <Controller
                  name="negacije"
                  control={control}
                  render={({ field }) => (
                    <NegationCheckbox
                      key="negate-delatnost"
                      value="negate-delatnost"
                      negationChecked={field.value?.includes("negate-delatnost") || false}
                      onNegationChange={(val) => {
                        if (field.value?.includes(val)) {
                          field.onChange(field.value.filter((v: string) => v !== val));
                        } else {
                          field.onChange([...(field.value || []), val]);
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <Controller
                  name="mesta"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteMultiple
                      data={mesta}
                      onCheckedChange={field.onChange}
                      placeholder="Mesta"
                      id="mesto"
                      key="autocomplete-mesto"
                      checkedValues={field.value || []}
                    />
                  )}
                />
              </Grid>
              <Grid px={2} size={2}>
                <Controller
                  name="negacije"
                  control={control}
                  render={({ field }) => (
                    <NegationCheckbox
                      key="negate-mesto"
                      value="negate-mesto"
                      negationChecked={field.value?.includes("negate-mesto") || false}
                      onNegationChange={(val) => {
                        if (field.value?.includes(val)) {
                          field.onChange(field.value.filter((v: string) => v !== val));
                        } else {
                          field.onChange([...(field.value || []), val]);
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <Controller
                  name="seminari"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteMultiple
                      data={sviSeminari}
                      onCheckedChange={field.onChange}
                      placeholder="Seminari"
                      id="seminar"
                      key="autocomplete-seminar"
                      checkedValues={field.value || []}
                      getOptionLabel={(option) => {
                        return `${format(option.datum, "dd.MM.yyyy")} - ${option.naziv}`;
                      }}
                      renderTag={(getTagProps, index, option) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            variant="outlined"
                            label={`${format(option.datum, "dd.MM.yyyy")} - ${option.naziv}`}
                            key={key}
                            {...tagProps}
                          />
                        );
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid px={2} size={2}>
                <Controller
                  name="negacije"
                  control={control}
                  render={({ field }) => (
                    <NegationCheckbox
                      key="negate-seminar"
                      value="negate-seminar"
                      negationChecked={field.value?.includes("negate-seminar") || false}
                      onNegationChange={(val) => {
                        if (field.value?.includes(val)) {
                          field.onChange(field.value.filter((v: string) => v !== val));
                        } else {
                          field.onChange([...(field.value || []), val]);
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={2}>
          <Controller
            name="velicineFirmi"
            control={control}
            render={({ field }) => (
              <CheckboxList
                data={velicineFirme}
                subheader="Veličine Firmi"
                checkedValues={field.value || []}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Grid>
        <Grid size={2}>
          <Controller
            name="stanjaFirme"
            control={control}
            render={({ field }) => (
              <CheckboxList
                data={stanjaFirme}
                subheader="Stanja Firmi"
                checkedValues={field.value || []}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} marginTop={2}>
        <Grid size={8}>
          <Grid container alignItems="center"></Grid>
        </Grid>
      </Grid>

      <Box
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
      >
        <Grid mt={4} maxWidth="lg">
          <Controller
            name="imeFirme"
            control={control}
            render={({ field }) => <TextField label="Ime Firme" {...field} />}
          />
          <Controller
            name="pib"
            control={control}
            render={({ field }) => <TextField label="PIB" {...field} />}
          />
          <Controller
            name="maticniBroj"
            control={control}
            render={({ field }) => <TextField label="Matični broj" {...field} />}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => <TextField label="E-mail" {...field} />}
          />
          <Controller
            name="jbkjs"
            control={control}
            render={({ field }) => <TextField label="JBKJS" {...field} />}
          />
          <Controller
            name="komentar"
            control={control}
            render={({ field }) => <TextField label="Komentar" {...field} />}
          />
          <Controller
            name="imePrezime"
            control={control}
            render={({ field }) => <TextField label="Ime i prezime zaposlenog" {...field} />}
          />
          <Controller
            name="emailZaposlenog"
            control={control}
            render={({ field }) => <TextField label="E-mail zaposlenog" {...field} />}
          />
        </Grid>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Box>
          <ExportButtons control={control} />

          <Button
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="info"
            startIcon={<SearchIcon />}
            type="submit"
          >
            Pretrazi
          </Button>
        </Box>

        <Box>
          <Button
            startIcon={<AddBoxIcon />}
            href="/Firma"
            target="_blank"
            sx={{ m: 1 }}
            variant="contained"
            size="large"
            color="secondary"
          >
            Dodaj Firmu
          </Button>
        </Box>
      </Box>
    </form>
  );
}
