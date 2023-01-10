import {
  FormControl,
  TextField,
  InputAdornment,
  Button,
  FormControlLabel,
  Autocomplete,
  Switch,
  Divider,
} from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { ICompanyData, IOptionalCompanyData } from "../../../fakeData/companyData";
import { companyFormMetadata, IMetadata, InputTypes } from "../MyForm/formMetadata";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

const companySchema = z
  .object({
    id: z.string(),
    sajt: z.string().max(50, "link za web sajt je predugacak").min(3, "link za websajt je prekratak"),
    naziv: z.string().max(100).min(4, "Naziv firme je previse kratak"),
    adresa: z.string().max(150),
    grad: z.string().max(50),
    opstina: z.string().max(100),
    pib: z.string().length(5),
    ptt: z.string().length(5, "PTT mora da ima 5 brojeva"),
    telefon: z.string(),
    email: z.string().email("Ne ispravna email adresa"),
    tipFirme: z.string(),
    velicina: z.string(),
    stanje: z.string(),
    odjava: z.boolean(),
    komentari: z.string(),
    lastTouched: z.date(),
    zaposleni: z.array(
      z
        .object({
          ime: z.string(),
          prezime: z.string(),
          email: z.string(),
          telefon: z.string(),
        })
        .optional()
    ),
  })
  .optional();

const formInitialValues: IOptionalCompanyData = {
  sajt: "",
  naziv: "",
  adresa: "",
  grad: "",
  opstina: "",
  pib: "",
  ptt: "",
  telefon: "",
  email: "",
  tipFirme: "",
  velicina: "",
  stanje: "",
  odjava: true,
  komentari: "",
  lastTouched: new Date(),
  zaposleni: [],
} as const;

export default function CompanyForm() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ICompanyData>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = (data: IOptionalCompanyData) => {
    console.log("hi");
    console.log(data);
  };

  const [odjava, setOdjava] = useState(formInitialValues.odjava);
  const handleOdjava = () => {
    setOdjava((prev) => !prev);
    console.log(odjava);
  };

  function renderFiled(register, item: IMetadata, errors: any) {
    if (item.inputType === InputTypes.Text) {
      return (
        <TextField
          {...register(item.key)}
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          name={item.key}
          defaultValue={formInitialValues[item.key]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypes.TextMultiline) {
      return (
        <TextField
          {...register(item.key)}
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
          defaultValue={formInitialValues[item.key]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypes.Switch) {
      return (
        <FormControlLabel
          sx={{ mx: "auto" }}
          control={<Switch color="error" defaultChecked={formInitialValues[item.key]} onChange={handleOdjava} />}
          label={odjava ? "ODJAVLJENI" : "Prijavljeni"}
        />
      );
    }

    if (item.inputType === InputTypes.Select) {
      return (
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={["neki sadrzaj 1", "neki sadrzaj 3", "tst", "bogdan", "filip"]}
          renderInput={(params) => {
            return <TextField {...params} label={item.label} variant="outlined" />;
          }}
        />
      );
    }
  }

  const textItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypes.Text)
    .map((item: IMetadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const autocompleteItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypes.Select)
    .map((item: IMetadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const switchItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypes.Switch)
    .map((item: IMetadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const textAreaItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypes.TextMultiline)
    .map((item: IMetadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  return (
    <Box onSubmit={handleSubmit(onSubmit)} component="form" sx={{ display: "flex", flexWrap: "wrap", flexGrow: 1 }}>
      <Grid2 container spacing={4}>
        {switchItems.map((item) => {
          return (
            <Grid2 sx={{ backgroundColor: odjava ? "salmon" : "lightgreen" }} key={item.key} xs={12}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />

        {textItems.map((item) => {
          return (
            <Grid2 key={item.key} xs={12} md={6} lg={4}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />

        {autocompleteItems.map((item) => {
          return (
            <Grid2 key={item.key} xs={12} md={6} lg={4}>
              {item}
            </Grid2>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />

        {textAreaItems}
        <Divider sx={{ width: "100%", my: 4 }} />

        <Button sx={{ my: 2 }} size="large" variant="contained" color="success" type="submit">
          Sačuvaj
        </Button>
      </Grid2>
    </Box>
  );
}
