import { TextField, Autocomplete, Checkbox, Button } from "@mui/material";
import { Box } from "@mui/system";
import { normalizedRadnaMesta } from "../../fakeData/companyData";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Zaposleni, ZaposleniSchema } from "../../schemas/companySchemas";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type ZaposleniFormProps = {
  zaposleni?: Zaposleni;
  onSubmit: (zaposleniData: Zaposleni) => void;
};

export function ZaposleniForm({ zaposleni, onSubmit }: ZaposleniFormProps) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const {
    register,
    handleSubmit,
    control,
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
      setValue("email", "");
      setValue("telefon", "");
      setValue("radnaMesta", []);
      setValue("komentari", "");
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
        {...register("email")}
        sx={{ m: 1 }}
        id="email"
        label="Email"
        variant="outlined"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />
      {/* <TextField
        {...register("broj-sertifikata")}
        sx={{ m: 1 }}
        id="broj-sertifikata"
        label="Broj sertifikata"
        variant="outlined"
        onChange={handleChange}
      /> */}
      <TextField
        {...register("telefon")}
        sx={{ m: 1 }}
        id="telefon"
        label="Telefon"
        variant="outlined"
        error={Boolean(errors.telefon)}
        helperText={errors.telefon?.message}
      />

      <Controller
        name="radnaMesta"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            value={field.value || []}
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
      ></Controller>

      <TextField
        {...register("komentari")}
        sx={{ m: 1, width: "98%" }}
        id="outlined-multiline-static"
        label="Komentari"
        multiline
        rows={4}
        error={Boolean(errors.komentari)}
        helperText={errors.komentari?.message}
      ></TextField>
      <Button sx={{ m: 1 }} variant="contained" type="submit">
        Sacuvaj zaposlenog
      </Button>
    </Box>
  );
}
