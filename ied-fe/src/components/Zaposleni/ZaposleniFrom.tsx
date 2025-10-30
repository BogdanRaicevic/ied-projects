import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useFetchData } from "../../hooks/useFetchData";
import { type Zaposleni, ZaposleniSchema } from "../../schemas/firmaSchemas";
import Single from "../Autocomplete/Single";

type ZaposleniFormProps = {
  zaposleni?: Zaposleni;
  onSubmit: (zaposleniData: Zaposleni) => void;
};

export function ZaposleniForm({ zaposleni, onSubmit }: ZaposleniFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Zaposleni>({
    resolver: zodResolver(ZaposleniSchema),
  });

  const [selectedRadnoMesto, setSelectedRadnoMesto] = useState(
    zaposleni?.radno_mesto || "",
  );
  let zaposleniData: Zaposleni;

  const handleDodajZaposlenog = (data: Zaposleni) => {
    zaposleniData = {
      ...data,
      radno_mesto: selectedRadnoMesto || "",
    };

    onSubmit(zaposleniData);
  };

  const onError = (errors: any, e: any) => {
    console.error("Zaposleni form errors: ", errors, e);
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

  const { radnaMesta } = useFetchData();
  return (
    <Box component="form">
      <TextField
        {...register("ime")}
        sx={{ m: 1 }}
        label="Ime"
        variant="outlined"
        error={Boolean(errors.ime)}
        helperText={errors.ime?.message}
      />
      <TextField
        {...register("prezime")}
        sx={{ m: 1 }}
        label="Prezime"
        variant="outlined"
        error={Boolean(errors.prezime)}
        helperText={errors.prezime?.message}
      />
      <TextField
        {...register("e_mail")}
        sx={{ m: 1 }}
        label="Email"
        variant="outlined"
        error={Boolean(errors.e_mail)}
        helperText={errors.e_mail?.message}
      />
      <TextField
        {...register("telefon")}
        sx={{ m: 1 }}
        label="Telefon"
        variant="outlined"
        error={Boolean(errors.telefon)}
        helperText={errors.telefon?.message}
      />

      <TextField
        {...register("komentar")}
        sx={{ m: 1, width: "100%" }}
        label="Komentari"
        multiline
        rows={4}
        error={Boolean(errors.komentar)}
        helperText={errors.komentar?.message}
      ></TextField>

      <Box sx={{ m: 1, width: "100%" }}>
        <Single
          data={radnaMesta}
          placeholder="Radno mesto"
          preselected={
            radnaMesta.length > 0 ? zaposleni?.radno_mesto || "" : ""
          }
          onChange={(newValue) => {
            setSelectedRadnoMesto(newValue);
          }}
        ></Single>
      </Box>
      <Button
        onClick={handleSubmit(handleDodajZaposlenog, onError)}
        sx={{ m: 1 }}
        variant="contained"
        type="submit"
      >
        Sačuvaj zaposlenog
      </Button>
    </Box>
  );
}
