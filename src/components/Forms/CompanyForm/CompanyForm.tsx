import {
  FormControl,
  TextField,
  InputAdornment,
  Button,
  FormControlLabel,
  Autocomplete,
  Switch,
  Divider,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { stanjaFirme, tipoviFirme, velicineFirme } from "../../../fakeData/companyData";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Metadata, CompanySchema, InputTypesSchema, Company } from "../../../schemas/companySchemas";
import { z } from "zod";
import {
  Warning,
  Business,
  TravelExplore,
  Home,
  LocationCity,
  DonutSmall,
  ConfirmationNumber,
  Phone,
  Email,
  Approval,
  SwitchAccount,
  Height,
  MonitorHeart,
  AccountCircle,
  Person,
  Comment,
} from "@mui/icons-material";

export const companyFormMetadata: Metadata[] = [
  { key: "odjava", label: "Odjava", inputAdornment: <Warning />, inputType: InputTypesSchema.enum.Switch },
  { key: "naziv", label: "Naziv kompanije", inputAdornment: <Business />, inputType: InputTypesSchema.enum.Text },
  { key: "sajt", label: "Sajt", inputAdornment: <TravelExplore />, inputType: InputTypesSchema.enum.Text },
  { key: "adresa", label: "Adresa", inputAdornment: <Home />, inputType: InputTypesSchema.enum.Text },
  { key: "grad", label: "Grad", inputAdornment: <LocationCity />, inputType: InputTypesSchema.enum.Text },
  { key: "opstina", label: "Opstina", inputAdornment: <DonutSmall />, inputType: InputTypesSchema.enum.Text },
  { key: "pib", label: "PIB", inputAdornment: <ConfirmationNumber />, inputType: InputTypesSchema.enum.Text },
  { key: "telefon", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypesSchema.enum.Text },
  { key: "email", label: "Email", inputAdornment: <Email />, inputType: InputTypesSchema.enum.Text },
  { key: "ptt", label: "Postanski broj", inputAdornment: <Approval />, inputType: InputTypesSchema.enum.Text },
  { key: "tip", label: "Tip firme", inputAdornment: <SwitchAccount />, inputType: InputTypesSchema.enum.Select },
  { key: "velicina", label: "Velicina firme", inputAdornment: <Height />, inputType: InputTypesSchema.enum.Select },
  { key: "stanje", label: "Stanje firme", inputAdornment: <MonitorHeart />, inputType: InputTypesSchema.enum.Select },
  { key: "komentari", label: "Komentari", inputAdornment: <Comment />, inputType: InputTypesSchema.enum.TextMultiline },
];

export const employeeFormMetadata: Metadata[] = [
  { key: "ime", label: "Ime", inputAdornment: <AccountCircle />, inputType: InputTypesSchema.enum.Text },
  { key: "prezime", label: "Prezime", inputAdornment: <Person />, inputType: InputTypesSchema.enum.Text },
  { key: "email-zaposlenog", label: "Email", inputAdornment: <Email />, inputType: InputTypesSchema.enum.Text },
  { key: "telefon-zaposlenog", label: "Telefon", inputAdornment: <Phone />, inputType: InputTypesSchema.enum.Text },
];

const formInitialValues: Company = {
  sajt: "",
  naziv: "",
  adresa: "",
  grad: "",
  opstina: "",
  pib: "",
  ptt: "",
  telefon: "",
  email: "",
  tip: "",
  velicina: "",
  stanje: "",
  odjava: false,
  komentari: "",
  lastTouched: "",
  zaposleni: [],
  id: "",
};

export default function CompanyForm() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<Company>({
    resolver: zodResolver(CompanySchema),
  });

  const onSubmit = (data: Company) => {
    console.log("hi");
    console.log(data);
  };

  const onError = (errors: any, e: any) => console.log(errors, e);

  const [odjava, setOdjava] = useState(formInitialValues.odjava);
  const handleOdjava = () => {
    setOdjava((prev) => !prev);
  };

  const [data, setData] = useState<Company>(formInitialValues);
  const handleFormChange = (e: any) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  function renderFiled(item: Metadata, errors: any) {
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key as keyof Company)}
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          name={item.key}
          defaultValue={formInitialValues[item.key as keyof Company]}
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
          defaultValue={formInitialValues[item.key as keyof Company]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.Switch) {
      return (
        <FormControlLabel
          sx={{ alignItems: "center", justifyContent: "center" }}
          control={
            <Switch
              {...register(item.key as keyof Company)}
              color="error"
              defaultChecked={formInitialValues.odjava}
              onChange={handleOdjava}
            />
          }
          label={odjava ? <Typography>ODJAVLJENI</Typography> : <Typography>Prijavljeni</Typography>}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.Select) {
      let optionsData: string[] = [];
      switch (item.key) {
        case "tip":
          optionsData = tipoviFirme;
          break;
        case "velicina":
          optionsData = velicineFirme;
          break;
        case "stanje":
          optionsData = stanjaFirme;
          break;
        default:
          break;
      }
      return (
        <Autocomplete
          {...register(item.key as keyof Company)} // TODO: fix this
          options={optionsData}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={item.label}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="end" sx={{ m: 1 }}>
                        {item.inputAdornment}
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            );
          }}
        />
      );
    }
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

  const employeeInputItems = (inputType: z.infer<typeof InputTypesSchema>) => {
    return employeeFormMetadata
      .filter((element) => element.inputType === inputType)
      .map((item: Metadata, index: number) => {
        return (
          <FormControl fullWidth key={`${item.key}-${index}`}>
            {renderFiled(item, errors)}
          </FormControl>
        );
      });
  };

  return (
    <Box onSubmit={handleSubmit(onSubmit, onError)} component="form" sx={{ mt: 4 }}>
      <Grid2 container m={0} spacing={2}>
        {inputItems(InputTypesSchema.enum.Switch).map((item) => {
          return (
            <Grid2 sx={{ backgroundColor: odjava ? "salmon" : "lightgreen" }} key={item.key} xs={12}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />

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
        <Divider sx={{ width: "100%", my: 4 }} />
        {/* <Button variant="contained" color="secondary">
          Dodaj zaposlenog kompanije
        </Button>
        {employeeInputItems(InputTypesSchema.enum.Text).map((item) => {
          return (
            <Grid2 key={item.key} xs={12} md={6} lg={4}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} /> */}

        <Button sx={{ my: 2 }} size="large" variant="contained" color="success" type="submit">
          Sačuvaj
        </Button>
      </Grid2>
    </Box>
  );
}
