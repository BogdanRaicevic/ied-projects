import { FormControl, TextField, InputAdornment, Button, Divider } from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import {
  Metadata,
  CompanySchema,
  InputTypesSchema,
  Company,
} from "../../../schemas/companySchemas";
import { z } from "zod";
import {
  // Warning,
  Business,
  // TravelExplore,
  Home,
  LocationCity,
  // DonutSmall,
  ConfirmationNumber,
  Phone,
  Email,
  Approval,
  SwitchAccount,
  Height,
  // MonitorHeart,
  Comment,
} from "@mui/icons-material";
import { fetchAllTipoviFirme } from "../../../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../../../api/velicina_firme.api";
import { fetchAllStanjaFirme } from "../../../api/stanja_firme.api";
import AutocompleteMultiple from "../../AutocompleteMultiple";

export const companyFormMetadata: Metadata[] = [
  {
    key: "naziv_firme",
    label: "Naziv Firme",
    inputAdornment: <Business />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "adresa",
    label: "Adresa",
    inputAdornment: <Home />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "mesto",
    label: "Mesto",
    inputAdornment: <LocationCity />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "PIB",
    label: "PIB",
    inputAdornment: <ConfirmationNumber />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "telefon",
    label: "Telefon",
    inputAdornment: <Phone />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "e_mail",
    label: "Email",
    inputAdornment: <Email />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "postanski_broj",
    label: "Postanski broj",
    inputAdornment: <Approval />,
    inputType: InputTypesSchema.enum.Text,
  },
  {
    key: "tip_firme",
    label: "Tip firme",
    inputAdornment: <SwitchAccount />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "velicina",
    label: "Velicina firme",
    inputAdornment: <Height />,
    inputType: InputTypesSchema.enum.Select,
  },
  {
    key: "komentar",
    label: "Komentari",
    inputAdornment: <Comment />,
    inputType: InputTypesSchema.enum.TextMultiline,
  },
];

type CompanyFormProps = {
  inputCompany: Company;
};

export const CompanyForm: React.FC<CompanyFormProps> = ({ inputCompany }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    // control,
    reset,
  } = useForm<Company>({
    resolver: zodResolver(CompanySchema),
    defaultValues: inputCompany || {},
  });

  // TODO: add types
  const [company, setCompany] = useState(inputCompany);

  const [tipoviFirme, setTipoviFirme] = useState([]);
  const [stanjaFirme, setStanjaFirme] = useState([]);
  const [velicinieFirme, setVelicineFirme] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [tipovi, velicine, stanja] = await Promise.all([
        fetchAllTipoviFirme(),
        fetchAllVelicineFirme(),
        fetchAllStanjaFirme(),
      ]);

      setTipoviFirme(tipovi);
      setVelicineFirme(velicine);
      setStanjaFirme(stanja);
    }
    console.log("stanja", stanjaFirme);
    loadData();
  }, []);

  useEffect(() => {
    setCompany(inputCompany);
    reset(inputCompany);
  }, [inputCompany, reset]);

  const onSubmit = (data: Company) => {
    console.log("hi");
    console.log(data);
  };

  const onError = (errors: any, e: any) => console.log("Company form errors: ", errors, e);

  function renderFiled(item: Metadata, errors: any) {
    console.log("render file", item);
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key as keyof Company)}
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          name={item.key}
          defaultValue={company[item.key as keyof Company]}
          error={Boolean(errors[item.key])}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.TextMultiline) {
      return (
        <TextField
          {...register(item.key as keyof Company)}
          label={item.label}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ pt: 1.5 }}>
                {item.inputAdornment}
              </InputAdornment>
            ),
            sx: { alignItems: "flex-start" },
          }}
          name={item.key}
          multiline
          rows={10}
          defaultValue={company[item.key as keyof Company]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    console.log("item", item);

    if (item.inputType === InputTypesSchema.enum.Select) {
      let optionsData: string[] = [];
      switch (item.key) {
        case "tip_firme":
          optionsData = tipoviFirme;
          break;
        case "velicina":
          optionsData = velicinieFirme;
          break;
        case "stanje":
          optionsData = stanjaFirme;
          break;
        default:
          break;
      }

    //   return (
    //     <AutocompleteMultiple
    //       data={optionsData}
    //       id={item.key}
    //       placeholder={item.label}
    //       onCheckedChange={() => console.log("test")}
    //       checkedValues={[]}
    //     ></AutocompleteMultiple>
    //   );
    // }
  }

  const inputItems = (inputType: z.infer<typeof InputTypesSchema>) => {
    return companyFormMetadata
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
      <Grid2 container m={0} spacing={2}>
        {inputItems(InputTypesSchema.enum.Text).map((item) => {
          return (
            <Grid2 key={item.key} xs={12} md={6} lg={4}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.Select).map((item) => {
          return (
            <Grid2 key={item.key} xs={12} md={6} lg={4}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.TextMultiline).map((item) => {
          return (
            <Grid2 key={item.key} xs={12}>
              {item}
            </Grid2>
          );
        })}
        <Button sx={{ my: 2 }} size="large" variant="contained" color="success" type="submit">
          Sačuvaj
        </Button>
        <Divider sx={{ width: "100%", my: 2 }} />
      </Grid2>
    </Box>
  );
};
