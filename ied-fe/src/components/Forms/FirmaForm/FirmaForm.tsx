import {
  FormControl,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Alert,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  type Metadata,
  FirmaSchema,
  InputTypesSchema,
  type FirmaType,
} from "../../../schemas/firmaSchemas";
import type { z } from "zod";

import AutocompleteSingle from "../../Autocomplete/Single";
import { useFetchData } from "../../../hooks/useFetchData";
import { firmaFormMetadata } from "./metadata";
import { deleteFirma, saveFirma } from "../../../api/firma.api";
import { extractErrorMessages, type ValidationError } from "../../../utils/zodErrorHelper";

type FirmaFormProps = {
  inputCompany: FirmaType;
};

export const FirmaForm: React.FC<FirmaFormProps> = ({ inputCompany }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<FirmaType>({
    resolver: zodResolver(FirmaSchema),
    defaultValues: inputCompany || {},
  });

  // TODO: add types
  const [company, setCompany] = useState(inputCompany);

  type SuccessAlert = {
    type: "success";
    message: string;
    errors: null;
  };

  type ErrorAlert = {
    type: "error";
    message: string;
    errors: ValidationError[];
  };

  const [alert, setAlert] = useState<SuccessAlert | ErrorAlert | null>(null);

  const {
    tipoviFirme: fetchedTipoviFirme,
    velicineFirme: fetchedVelicineFirme,
    stanjaFirme: fetchedStanjaFirme,
    mesta: fetchedMesta,
    delatnosti: fetchedDelatnosti,
  } = useFetchData();

  const [tipoviFirme, setTipoviFirme] = useState([]);
  const [stanjaFirme, setStanjaFirme] = useState([]);
  const [velicinieFirme, setVelicineFirme] = useState([]);
  const [mesta, setMesta] = useState([]);
  const [delatnosti, setDelatnosti] = useState([]);
  const [autocompletes, setAutocompletes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = () => {
      setTipoviFirme(fetchedTipoviFirme || []);
      setStanjaFirme(fetchedStanjaFirme || []);
      setVelicineFirme(fetchedVelicineFirme || []);
      setMesta(fetchedMesta || []);
      setDelatnosti(fetchedDelatnosti || []);
    };

    fetchData();
  }, [
    fetchedStanjaFirme,
    fetchedTipoviFirme,
    fetchedVelicineFirme,
    fetchedMesta,
    fetchedDelatnosti,
  ]);

  useEffect(() => {
    setCompany(inputCompany);
    reset(inputCompany);
  }, [inputCompany, reset]);

  const onSubmit = async (data: FirmaType) => {
    data = {
      ...data,
      ...autocompletes,
    };

    const response = await saveFirma(data);
    if (response.status.toString().startsWith("2")) {
      setAlert({
        type: "success",
        message: "Firma uspešno sačuvana!",
        errors: null,
      });
    } else {
      setAlert({
        type: "error",
        message: "Firma nije sačuvana. Došlo je do greške!",
        errors: [],
      });
    }

    const alertTimeout = setTimeout(() => {
      setAlert(null);
    }, 3000);

    // Clear the timeout if the component unmounts
    return () => clearTimeout(alertTimeout);
  };

  const onError = (errors: any) => {
    const data = {
      ...watch(),
      ...autocompletes,
    };
    const errorMessages = extractErrorMessages(errors, data);
    setAlert({
      type: "error",
      message: "Firma nije sačuvana. Došlo je do greške!",
      errors: errorMessages,
    });
    console.error("Validation errors", errors);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm("Da li ste sigurni da želite da obrišete firmu?");
      if (confirmed) {
        await deleteFirma(id);
        setAlert({
          type: "success",
          message: "Firma uspešno obrisana!",
          errors: null,
        });
        window.close();
      }
    } catch (error) {
      console.error("Error deleting company", error);
      setAlert({
        type: "error",
        message: "Greška prilikom brisanja firme",
        errors: [],
      });
    }
  };

  function renderFiled(item: Metadata, errors: any) {
    // console.log("render file", item);
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key as keyof FirmaType)}
          label={item.label}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">{item.inputAdornment}</InputAdornment>
              ),
            },
          }}
          name={item.key}
          defaultValue={company[item.key as keyof FirmaType]}
          error={Boolean(errors[item.key])}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.TextMultiline) {
      return (
        <TextField
          {...register(item.key as keyof FirmaType)}
          label={item.label}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ pt: 1.5 }}>
                  {item.inputAdornment}
                </InputAdornment>
              ),
              sx: { alignItems: "flex-start" },
            },
          }}
          name={item.key}
          multiline
          rows={10}
          defaultValue={company[item.key as keyof FirmaType]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.Select) {
      let optionsData: string[] = [];
      switch (item.key) {
        case "tip_firme":
          optionsData = tipoviFirme;
          break;
        case "velicina_firme":
          optionsData = velicinieFirme;
          break;
        case "stanje_firme":
          optionsData = stanjaFirme;
          break;
        case "mesto":
          optionsData = mesta;
          break;
        case "delatnost":
          optionsData = delatnosti;
          break;
        default:
          break;
      }

      return (
        <AutocompleteSingle
          data={optionsData}
          id={item.key}
          placeholder={item.label}
          preselected={company[item.key as keyof FirmaType] as string}
          onChange={(newValue) => {
            handleAutocomplete(item.key, newValue);
          }}
        />
      );
    }
  }
  const handleAutocomplete = (key: string, newValue: any) => {
    setAutocompletes((prevState) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const inputItems = (inputType: z.infer<typeof InputTypesSchema>) => {
    return firmaFormMetadata
      .filter((element) => element.inputType === inputType)
      .map((item: Metadata) => {
        return (
          <FormControl fullWidth key={item.key}>
            {renderFiled(item, errors)}
          </FormControl>
        );
      });
  };

  return (
    <Box onSubmit={handleSubmit(onSubmit, onError)} component="form" sx={{ mt: 4 }}>
      <Grid container m={0} spacing={2}>
        {inputItems(InputTypesSchema.enum.Text).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12, md: 6, lg: 4 }}>
              {item}
            </Grid>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.Select).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12, md: 6, lg: 4 }}>
              {item}
            </Grid>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.TextMultiline).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12 }}>
              {item}
            </Grid>
          );
        })}

        <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Button
              sx={{ my: 2 }}
              size="large"
              variant="contained"
              color="success"
              type="submit"
              disabled={!watch("naziv_firme")}
            >
              Sačuvaj
            </Button>
            {!watch("naziv_firme") && (
              <Typography color="error" sx={{ mt: 1 }}>
                Polje "Naziv firme" mora biti popunjeno
              </Typography>
            )}
          </Box>
          {company?._id && (
            <Button
              sx={{ my: 2 }}
              size="large"
              variant="contained"
              color="error"
              onClick={() => handleDelete(company._id || "")}
            >
              Obriši firmu
            </Button>
          )}
        </Grid>

        {alert && (
          <Alert severity={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
            {alert.errors && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Greške:</Typography>
                <ul>
                  {alert.errors.map((error) => {
                    return (
                      <li key={error.message}>
                        {error.message}; Polje: `{error.field}`; Problematična vrednost: `
                        {<b>{error.value}</b>}`
                      </li>
                    );
                  })}
                </ul>
              </Box>
            )}
          </Alert>
        )}
        <Divider sx={{ width: "100%", my: 2 }} />
      </Grid>
    </Box>
  );
};
