import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  colors,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { differenceInCalendarDays, formatDate, isToday } from "date-fns";
import { isNil } from "es-toolkit";
import {
  ContactTypes,
  FirmaSchema,
  type FirmaType,
  type ZaposleniType,
} from "ied-shared";
import { Activity, type FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useEmailSuppression } from "../../hooks/firma/useEmailSuppression";
import {
  useAddLastContact,
  useCreateNewFirma,
  useDeleteFirma,
  useUpdateFirma,
} from "../../hooks/firma/useFirmaMutations";
import { useGetMesta } from "../../hooks/mesto/useMestoQueries";
import { useFetchPretragaData } from "../../hooks/useFetchData";
import {
  type InputTypes,
  InputTypesSchema,
  type Metadata,
} from "../../schemas/metadata";
import AutocompleteSingle from "../Autocomplete/Single";
import MailingListSwitch from "../MailingListSwitch";
import { firmaFormMetadata } from "./firmaFormMetadata";

type FirmaFormProps = {
  inputCompany: FirmaType;
};

type FirmaFormInput = z.input<typeof FirmaSchema>;

export const FirmaForm: FC<FirmaFormProps> = ({ inputCompany }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<FirmaFormInput, unknown, FirmaType>({
    resolver: zodResolver(FirmaSchema),
    defaultValues: inputCompany,
  });

  const { tipoviFirme, velicineFirme, stanjaFirme, delatnosti } =
    useFetchPretragaData();

  const { data: mesta } = useGetMesta();

  const isEditing = !!inputCompany?._id;
  const currentFirmaId = inputCompany?._id || null;

  const createFirmaMutation = useCreateNewFirma();
  const updateFirmaMutation = useUpdateFirma(currentFirmaId);
  const deleteFirmaMutation = useDeleteFirma(currentFirmaId);
  const updateLastContactMutation = useAddLastContact(currentFirmaId);

  const isSubmitting =
    createFirmaMutation.isPending || updateFirmaMutation.isPending;

  useEffect(() => {
    reset(inputCompany);
    if (inputCompany?.e_mail) {
      trigger("e_mail");
    }
  }, [inputCompany, reset, trigger]);

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
      // We have an ID, so we are updating (exclude data maintained by dedicated mutations)
      const {
        zaposleni: _omitZaposleni,
        last_contacted: _omitLastContacted,
        ...firmaOnly
      } = cleanData;

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
      const isEmail = item.key === "e_mail";

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
          onBlur={
            isEmail ? withEmailBlur(register("e_mail").onBlur) : undefined
          }
          error={isEmail ? Boolean(errors.e_mail) : Boolean(errors[item.key])}
          helperText={
            isEmail ? (
              errors.e_mail?.message ? (
                errors.e_mail.message
              ) : suppressionWarning ? (
                <Typography
                  component="span"
                  variant="caption"
                  color="warning.main"
                >
                  {suppressionWarning}
                </Typography>
              ) : null
            ) : (
              errors[item.key]?.message
            )
          }
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

  const inputItems = (inputType: InputTypes) => {
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

  const { suppressionWarning, handleMailingListChange, withEmailBlur } =
    useEmailSuppression(email, setValue);

  const previousContacts = inputCompany?.last_contacted || [];
  const lastContact = previousContacts[previousContacts.length - 1];
  const contactedAgo = lastContact
    ? differenceInCalendarDays(new Date(), new Date(lastContact.date))
    : 0;
  const wasContactedWithin180Days =
    lastContact?.date !== undefined && contactedAgo <= 180;
  const isLastContactToday = isNil(lastContact?.date)
    ? false
    : isToday(lastContact.date);

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
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              bgcolor: colors.blue[50],
              border: "1px solid",
              borderColor: "primary.light",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography variant="subtitle2" color="primary.dark" gutterBottom>
              Status kontaktiranja
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Button
                    disabled={
                      !currentFirmaId ||
                      updateLastContactMutation.isPending ||
                      isLastContactToday
                    }
                    onClick={() =>
                      updateLastContactMutation.mutate(
                        ContactTypes.informativni_poziv,
                      )
                    }
                    variant="outlined"
                  >
                    Kontaktirana informativno
                  </Button>

                  {updateLastContactMutation.isError && (
                    <Typography variant="caption" color="error.main">
                      Greška: {updateLastContactMutation.error?.message}
                    </Typography>
                  )}
                </Box>

                <Activity
                  mode={wasContactedWithin180Days ? "visible" : "hidden"}
                >
                  <Typography variant="body2" color="success.main">
                    ✓ Kontaktirana u poslednjih 180 dana ({contactedAgo})
                  </Typography>
                </Activity>
                <Activity
                  mode={
                    !wasContactedWithin180Days && lastContact
                      ? "visible"
                      : "hidden"
                  }
                >
                  <Typography variant="body2" color="error.main">
                    ✗ Nije kontaktirana u poslednjih 180 dana{" "}
                    {contactedAgo <= 180 ? "" : `(${contactedAgo} dana)`}
                  </Typography>
                </Activity>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Kliknite na dugme ako ste kontaktirali ovu firmu
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%", // Helps keep it vertically centered with the columns next to it
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 1.5 }}
                  >
                    Poslednji kontakt
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Kontaktirao/la:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {lastContact ? lastContact.e_mail : "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Datum:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {lastContact
                          ? formatDate(new Date(lastContact.date), "dd.MM.yyyy")
                          : "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Način:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {lastContact ? lastContact.contact_type : "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Grid
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      disabled={
                        !currentFirmaId ||
                        !lastContact ||
                        lastContact.contact_type ===
                          ContactTypes.komercijalni_poziv
                      }
                      onClick={() =>
                        updateLastContactMutation.mutate(
                          ContactTypes.komercijalni_poziv,
                        )
                      }
                      variant="outlined"
                    >
                      Obavljen Komercijalni Razgovor
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Divider sx={{ width: "100%", my: 4 }} />

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Autocomplete
            fullWidth
            options={mesta || []}
            getOptionLabel={(option) => option.naziv_mesto}
            disablePortal
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => <TextField {...params} label="Mesto" />}
            onChange={(_event, newValue) => {
              setValue("mesto", newValue ?? undefined);
            }}
            value={
              mesta?.find((option) => option._id === watch("mesto")?._id) ??
              null
            }
          />
        </Grid>
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
