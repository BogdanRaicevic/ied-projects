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
import { FirmaSchema, type FirmaType, type ZaposleniType } from "ied-shared";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  addEmailToSuppressionList,
  checkIfEmailIsSuppressed,
  removeEmailFromSuppressionList,
} from "../../api/email_suppression.api";
import {
  useCreateNewFirma,
  useDeleteFirma,
  useUpdateFirma,
} from "../../hooks/firma/useFirmaMutations";
import { useFetchData } from "../../hooks/useFetchData";
import { InputTypesSchema, type Metadata } from "../../schemas/metadata";
import AutocompleteSingle from "../Autocomplete/Single";
import MailingListSwitch from "../MailingListSwitch";
import { firmaFormMetadata } from "./firmaFormMetadata";

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
    setValue,
  } = useForm<z.input<typeof FirmaSchema>, any, z.output<typeof FirmaSchema>>({
    resolver: zodResolver(FirmaSchema), // find a way to pull error from this
    defaultValues: inputCompany,
  });

  const { tipoviFirme, velicineFirme, stanjaFirme, mesta, delatnosti } =
    useFetchData();

  const isEditing = !!inputCompany?._id;
  const currentFirmaId = inputCompany?._id || null;

  const createFirmaMutation = useCreateNewFirma();
  const updateFirmaMutation = useUpdateFirma(currentFirmaId);
  const deleteFirmaMutation = useDeleteFirma(currentFirmaId);

  const isSubmitting =
    createFirmaMutation.isPending || updateFirmaMutation.isPending;

  useEffect(() => {
    reset(inputCompany);
  }, [inputCompany, reset]);

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
  };

  const onSubmit = (data: FirmaType) => {
    const cleanData = {
      ...data,
      zaposleni:
        data.zaposleni?.map((z) => {
          if (z._id?.startsWith("temp")) {
            const { _id, ...rest } = z;
            return rest;
          }
          return z;
        }) || [],
    };

    if (isEditing) {
      // We have an ID, so we are updating (exclude zaposleni; use dedicated mutations)
      const { zaposleni: _omit, ...firmaOnly } = cleanData;
      updateFirmaMutation.mutate(firmaOnly, {
        onSuccess: (savedCompany) => {
          reset(savedCompany);
        },
      });
    } else {
      // No ID, so we are creating a new firma
      createFirmaMutation.mutate(cleanData, {
        onSuccess: (savedCompany) => {
          reset(savedCompany);
        },
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Da li ste sigurni da želite da obrišete firmu?",
    );
    if (confirmed) {
      deleteFirmaMutation.mutate(undefined, {
        onSuccess: () => {
          console.log("Firma successfully deleted and navigated.");
        },
        onError: (error) => {
          // The component's main error alert will already show this.
          console.error("Failed to delete firma:", error);
        },
      });
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

  const isPrijavljen = Boolean(watch("prijavljeni"));
  const email = watch("e_mail");

  const handleMailingListChange = async (newValue: boolean) => {
    if (!email) {
      setValue("prijavljeni", newValue);
      return;
    }

    const suppressionStatus = await checkIfEmailIsSuppressed(email);

    if (suppressionStatus && suppressionStatus.reason !== "UNSUBSCRIBED") {
      console.error(
        `Cannot subscribe ${email}. Reason: ${suppressionStatus.reason}`,
      );
      setValue("prijavljeni", false);
      return;
    }

    if (newValue === false) {
      await addEmailToSuppressionList(email);
    } else {
      await removeEmailFromSuppressionList(email);
    }

    setValue("prijavljeni", newValue);
  };

  return (
    <Box
      onSubmit={handleSubmit(onSubmit, onError)}
      component="form"
      sx={{ mt: 4 }}
    >
      <MailingListSwitch
        isPrijavljen={isPrijavljen}
        onChange={handleMailingListChange}
      />
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
              disabled={!watch("naziv_firme") || isSubmitting}
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
              onClick={handleDelete}
            >
              Obriši firmu
            </Button>
          )}
        </Grid>

        {/* Displaying errors from the mutation hooks */}
        {(createFirmaMutation.isError ||
          updateFirmaMutation.isError ||
          deleteFirmaMutation.isError) && ( // Include delete error
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            Greška:{" "}
            {createFirmaMutation.error?.message ||
              updateFirmaMutation.error?.message ||
              deleteFirmaMutation.error?.message}
          </Alert>
        )}

        {/* Displaying success messages from the mutation hooks */}
        {(createFirmaMutation.isSuccess ||
          updateFirmaMutation.isSuccess ||
          deleteFirmaMutation.isSuccess) && (
          <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
            {createFirmaMutation.isSuccess
              ? "Firma uspešno sačuvana!"
              : updateFirmaMutation.isSuccess
                ? "Firma uspešno ažurirana!"
                : deleteFirmaMutation.isSuccess
                  ? "Firma uspešno obrisana!"
                  : null}
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
                          field as keyof ZaposleniType
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
