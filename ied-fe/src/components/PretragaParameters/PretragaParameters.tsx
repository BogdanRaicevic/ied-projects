import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { format } from "date-fns";
import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchSeminari } from "../../hooks/seminar/useSeminarQueries";
import { useFetchPretragaData } from "../../hooks/useFetchData";
import {
  defaultPretrageParameters,
  usePretragaStore,
} from "../../store/pretragaParameters.store";
import AutocompleteMultiple from "../Autocomplete/Multiple";
import CheckboxList from "../CheckboxList";
import NegationCheckbox from "../NegationCheckbox";
import { ExportButtons } from "./ExportButtons";

export default function PretragaParameters() {
  const {
    delatnosti,
    mesta,
    radnaMesta,
    tipoviFirme,
    velicineFirme,
    stanjaFirme,
  } = useFetchPretragaData();

  const { data: fetchedSeminars } = useSearchSeminari({
    pageIndex: 0,
    pageSize: 50,
    queryParameters: {
      naziv: "",
      lokacija: "",
      predavac: "",
      tipSeminara: [],
    },
  });

  const seminarTitles =
    fetchedSeminars?.seminari.map((seminar) => {
      return `${format(seminar.datum, "dd.MM.yyyy")} - ${seminar.naziv}`;
    }) || [];

  const {
    setPretragaParameters,
    setPaginationParameters,
    setAppliedParameters,
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

  const onSubmit = useCallback(
    (data: FirmaQueryParams) => {
      setPretragaParameters(data);
      setPaginationParameters({ pageIndex: 0, pageSize: 50 });
      setAppliedParameters();
    },
    [setPretragaParameters, setPaginationParameters, setAppliedParameters],
  );

  const toggleNegation = useCallback((field: any, val: string) => {
    if (field.value?.includes(val)) {
      field.onChange(field.value.filter((v: string) => v !== val));
    } else {
      field.onChange([...(field.value || []), val]);
    }
  }, []);

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
                      negationChecked={
                        field.value?.includes("negate-radno-mesto") || false
                      }
                      onNegationChange={(val) => toggleNegation(field, val)}
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
                      negationChecked={
                        field.value?.includes("negate-tip-firme") || false
                      }
                      onNegationChange={(val) => toggleNegation(field, val)}
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
                      negationChecked={
                        field.value?.includes("negate-delatnost") || false
                      }
                      onNegationChange={(val) => toggleNegation(field, val)}
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
                      negationChecked={
                        field.value?.includes("negate-mesto") || false
                      }
                      onNegationChange={(val) => toggleNegation(field, val)}
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
                      id="seminari"
                      data={seminarTitles}
                      onCheckedChange={field.onChange}
                      placeholder="Seminari"
                      key="autocomplete-seminar"
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
                      key="negate-seminar"
                      value="negate-seminar"
                      negationChecked={
                        field.value?.includes("negate-seminar") || false
                      }
                      onNegationChange={(val) => toggleNegation(field, val)}
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

      <Grid container spacing={2} mt={2}>
        <Grid size={3}>
          <Controller
            name="firmaPrijavljeni"
            control={control}
            render={({ field }) => {
              const handleChange = (
                event: React.ChangeEvent<HTMLInputElement>,
              ) => {
                const value = event.target.value;
                if (value === "true") {
                  field.onChange(true);
                } else if (value === "false") {
                  field.onChange(false);
                } else {
                  field.onChange(undefined);
                }
              };

              const fieldValue =
                field.value === true
                  ? "true"
                  : field.value === false
                    ? "false"
                    : "sve";

              return (
                <FormControl>
                  <FormLabel>Firme prijavljene na majling listu:</FormLabel>
                  <RadioGroup value={fieldValue} onChange={handleChange}>
                    <FormControlLabel
                      value="sve"
                      control={<Radio />}
                      label="Sve"
                    />
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Prijavljene"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Odjavljene"
                    />
                  </RadioGroup>
                </FormControl>
              );
            }}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="zaposleniPrijavljeni"
            control={control}
            render={({ field }) => {
              const handleChange = (
                event: React.ChangeEvent<HTMLInputElement>,
              ) => {
                const value = event.target.value;
                if (value === "true") {
                  field.onChange(true);
                } else if (value === "false") {
                  field.onChange(false);
                } else {
                  field.onChange(undefined);
                }
              };

              const fieldValue =
                field.value === true
                  ? "true"
                  : field.value === false
                    ? "false"
                    : "svi";

              return (
                <FormControl>
                  <FormLabel>Zaposleni prijavljeni na majling listu:</FormLabel>
                  <RadioGroup value={fieldValue} onChange={handleChange}>
                    <FormControlLabel
                      value="svi"
                      control={<Radio />}
                      label="Svi"
                    />
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Prijavljeni"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Odjavljeni"
                    />
                  </RadioGroup>
                </FormControl>
              );
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} columns={12} mt={4} mb={4}>
        <Grid size={3}>
          <Controller
            name="imeFirme"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="Ime Firme" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="pib"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="PIB" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="maticniBroj"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="Matični broj" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="E-mail" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="jbkjs"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="JBKJS" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="komentar"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="Komentar" {...field} />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="imePrezime"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Ime i prezime zaposlenog"
                {...field}
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Controller
            name="emailZaposlenog"
            control={control}
            render={({ field }) => (
              <TextField fullWidth label="E-mail zaposlenog" {...field} />
            )}
          />
        </Grid>
      </Grid>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={4}
      >
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
