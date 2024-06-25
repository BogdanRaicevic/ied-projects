import { TextField, Button } from "@mui/material";
import { Box } from "@mui/system";
// import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Zaposleni, ZaposleniSchema } from "../../schemas/companySchemas";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type ZaposleniFormProps = {
  zaposleni?: Zaposleni;
  onSubmit: (zaposleniData: Zaposleni) => void;
};

export function ZaposleniForm({ zaposleni, onSubmit }: ZaposleniFormProps) {
  // const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  // const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const {
    register,
    handleSubmit,
    // control,
    setValue,
    formState: { errors },
  } = useForm<Zaposleni>({
    resolver: zodResolver(ZaposleniSchema),
  });

  const handleDodajZaposlenog = (data: Zaposleni) => {
    console.log("Zaposleni form data: ", data);
    onSubmit(data);
  };

  const onError = (errors: any, e: any) => {
    console.log("Zaposleni form errors: ", errors, e);
  };

  useEffect(() => {
    if (zaposleni) {
      for (const [key, value] of Object.entries(zaposleni)) {
        setValue(key as keyof Zaposleni, value);
      }
    } else {
      // Reset form values when zaposleni is undefined
      setValue("ime", "");
      setValue("prezime", "");
      setValue("e_mail", "");
      setValue("telefon", "");
      setValue("radno_mesto", "");
      setValue("komentar", "");
    }
  }, [zaposleni, setValue]);

  return (
    <Box paddingBottom={5} component="form" onSubmit={handleSubmit(handleDodajZaposlenog, onError)}>
      <TextField
        {...register("ime")}
        sx={{ m: 1 }}
        id="ime"
        label="Ime"
        variant="outlined"
        error={Boolean(errors.ime)}
        helperText={errors.ime?.message}
      />
      <TextField
        {...register("prezime")}
        sx={{ m: 1 }}
        id="prezime"
        label="Prezime"
        variant="outlined"
        error={Boolean(errors.prezime)}
        helperText={errors.prezime?.message}
      />
      <TextField
        {...register("e_mail")}
        sx={{ m: 1 }}
        id="email"
        label="Email"
        variant="outlined"
        error={Boolean(errors.e_mail)}
        helperText={errors.e_mail?.message}
      />
      <TextField
        {...register("telefon")}
        sx={{ m: 1 }}
        id="telefon"
        label="Telefon"
        variant="outlined"
        error={Boolean(errors.telefon)}
        helperText={errors.telefon?.message}
      />

      {/* <Controller
        name="radno_mesto"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            value={Array.isArray(field.value) ? field.value : [field.value]} // Ensure field.value is always an array
            sx={{ m: 1, width: "98%" }}
            multiple
            limitTags={2}
            id="multiple-radna-mesta"
            options={normalizedRadnaMesta}
            getOptionLabel={(option) => option}
            onChange={(_event, newValue) => field.onChange(newValue)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Radna mesta"
                placeholder="Radna mesta"
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        )}
      ></Controller> */}

      <TextField
        {...register("komentar")}
        sx={{ m: 1, width: "98%" }}
        id="outlined-multiline-static"
        label="Komentari"
        multiline
        rows={4}
        error={Boolean(errors.komentar)}
        helperText={errors.komentar?.message}
      ></TextField>
      <Button sx={{ m: 1 }} variant="contained" type="submit">
        Sacuvaj zaposlenog
      </Button>
    </Box>
  );
}
