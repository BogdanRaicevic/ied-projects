import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { ZaposleniSchema, type ZaposleniType } from "ied-shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  addEmailToSuppressionList,
  checkIfEmailIsSuppressed,
  removeEmailFromSuppressionList,
} from "../../api/email_suppression.api";
import { useFetchData } from "../../hooks/useFetchData";
import Single from "../Autocomplete/Single";
import MailingListSwitch from "../MailingListSwitch";

type ZaposleniFormProps = {
  zaposleni?: ZaposleniType;
  onSubmit: (zaposleniData: ZaposleniType) => void;
};

export function ZaposleniForm({ zaposleni, onSubmit }: ZaposleniFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ZaposleniType>({
    resolver: zodResolver(ZaposleniSchema),
    defaultValues: {
      ime: "",
      prezime: "",
      e_mail: "",
      telefon: "",
      radno_mesto: "",
      komentar: "",
      ...zaposleni,
      prijavljeni: zaposleni?.prijavljeni ?? true,
    },
  });

  const [selectedRadnoMesto, setSelectedRadnoMesto] = useState(
    zaposleni?.radno_mesto || "",
  );
  let zaposleniData: ZaposleniType;

  const handleDodajZaposlenog = (data: ZaposleniType) => {
    zaposleniData = {
      ...data,
      radno_mesto: selectedRadnoMesto || "",
    };

    onSubmit(zaposleniData);
  };

  const onError = (errors: any, e: any) => {
    console.error("Zaposleni form errors: ", errors, e);
  };

  const { radnaMesta, isRadnaMestaLoading } = useFetchData();
  const isPrijavljen = watch("prijavljeni");
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
    <Box component="form">
      <MailingListSwitch
        isPrijavljen={isPrijavljen}
        onChange={handleMailingListChange}
      />
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
        {isRadnaMestaLoading ? (
          <TextField
            disabled
            fullWidth
            label="Radno mesto"
            value="Učitavanje..."
          />
        ) : (
          <Single
            data={radnaMesta || []}
            placeholder="Radno mesto"
            preselected={zaposleni?.radno_mesto || ""}
            onChange={(newValue) => {
              setSelectedRadnoMesto(newValue);
            }}
          ></Single>
        )}
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
