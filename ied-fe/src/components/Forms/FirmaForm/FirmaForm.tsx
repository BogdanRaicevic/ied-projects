import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { deleteFirma, saveFirma } from "../../../api/firma.api";
import { useFetchData } from "../../../hooks/useFetchData";
import {
  FirmaSchema,
  type FirmaType,
  InputTypesSchema,
  type Metadata,
  type Zaposleni,
} from "../../../schemas/firmaSchemas";
import AutocompleteSingle from "../../Autocomplete/Single";
import { firmaFormMetadata } from "./metadata";

type FirmaFormProps = {
  inputCompany: FirmaType;
  onSubmit?: (data: FirmaType) => void;
};

export const FirmaForm: React.FC<FirmaFormProps> = ({
  inputCompany,
  onSubmit: parentOnSubmit,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<z.input<typeof FirmaSchema>, any, z.output<typeof FirmaSchema>>({
    resolver: zodResolver(FirmaSchema), // find a way to pull error from this
    defaultValues: inputCompany,
  });

  const { tipoviFirme, velicineFirme, stanjaFirme, mesta, delatnosti } =
    useFetchData();

  const [alert, setAlert] = useState<any>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [currentFirmaId, setCurrentFirmaId] = useState<string | null>(
    inputCompany?._id || null,
  );

  // Update form values when inputCompany changes
  useEffect(() => {
    if (inputCompany) {
      reset(inputCompany);
      setCurrentFirmaId(inputCompany._id || null);
    }
  }, [inputCompany, reset]);

  const onSubmit = async (data: FirmaType) => {
    try {
      // If we have an _id, we're updating an existing firma
      const firmaData = currentFirmaId
        ? { ...data, _id: currentFirmaId }
        : data;
      const savedCompany = await saveFirma(firmaData);

      // Update the current firma ID if this was a new creation
      if (!currentFirmaId) {
        setCurrentFirmaId(savedCompany.data._id);
      }

      // Call parent onSubmit if provided
      if (parentOnSubmit) {
        parentOnSubmit(savedCompany.data);
      }

      reset(savedCompany.data);
      setAlert({
        type: "success",
        message: currentFirmaId
          ? "Firma uspešno ažurirana!"
          : "Firma uspešno sačuvana!",
        errors: null,
      });
    } catch (error: any) {
      setErrorAlert(
        `Firma nije sačuvana. Došlo je do greške! ${error?.response?.data?.message}`,
      );
      setTimeout(() => {
        setErrorAlert(null);
      }, 5000);
    } finally {
      const alertTimeout = setTimeout(() => {
        setAlert(null);
      }, 5000);

      const errorTimeout = setTimeout(() => {
        setAlert(null);
      }, 5000);

      const cleanup = () => {
        clearTimeout(alertTimeout);
        clearTimeout(errorTimeout);
      };

      cleanup();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm(
        "Da li ste sigurni da želite da obrišete firmu?",
      );
      if (confirmed) {
        await deleteFirma(id);
        setAlert({
          type: "success",
          message: "Firma uspešno obrisana!",
          errors: null,
        });
        window.close();
      }
    } catch (error: any) {
      setErrorAlert(
        `Greška prilikom brisanja firme: ${error?.response?.data?.message}`,
      );
      setTimeout(() => {
        setErrorAlert(null);
      }, 5000);
    }
  };

  function renderFiled(item: Metadata, errors: any) {
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key as keyof FirmaType)}
          label={item.label}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {item.inputAdornment}
                </InputAdornment>
              ),
            },
          }}
          name={item.key}
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
          optionsData = velicineFirme;
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
          preselected={watch(item.key as keyof FirmaType) as string}
          onChange={(newValue) => {
            setValue(item.key as keyof FirmaType, newValue);
          }}
        />
      );
    }
  }

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
    <Box onSubmit={handleSubmit(onSubmit)} component="form" sx={{ mt: 4 }}>
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

        <Grid
          size={{ xs: 12 }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
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
          {inputCompany?._id && (
            <Button
              sx={{ my: 2 }}
              size="large"
              variant="contained"
              color="error"
              onClick={() => handleDelete(inputCompany._id || "")}
            >
              Obriši firmu
            </Button>
          )}
        </Grid>

        {alert && (
          <Alert
            severity={alert.type}
            sx={{ width: "100%", mt: 2 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}
        {errorAlert && (
          <Alert
            severity="error"
            sx={{ width: "100%", mt: 2 }}
            onClose={() => setErrorAlert(null)}
          >
            {errorAlert}
          </Alert>
        )}
        {/* TODO: Remove this and substitute with a more generic error handling */}
        {Array.isArray(errors.zaposleni) && errors.zaposleni.some(Boolean) && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.zaposleni.map((zErr, idx) =>
                zErr
                  ? Object.entries(zErr).map(([field, errObj]) => {
                      // Get the problematic value if available
                      const value =
                        inputCompany.zaposleni?.[idx]?.[
                          field as keyof Zaposleni
                        ];
                      return (
                        <li key={field + idx}>
                          Zaposleni #{idx + 1} - <b>{field}</b>
                          {value !== undefined && (
                            <>
                              (
                              <span style={{ color: "#d32f2f" }}>
                                {String(value)}
                              </span>
                              )
                            </>
                          )}
                          : {(errObj as any)?.message}
                        </li>
                      );
                    })
                  : null,
              )}
            </ul>
          </Alert>
        )}
      </Grid>
    </Box>
  );
};
