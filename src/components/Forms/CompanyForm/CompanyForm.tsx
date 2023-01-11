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
import { stanjaFirme, tipoviFirme, velicineFirme } from "../../../fakeData/companyData";
import { companyFormMetadata } from "../MyForm/formMetadata";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Metadata, CompanySchema, InputTypesSchema, Company } from "../../../schemas/companySchemas";

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
  odjava: true,
  komentari: "",
  lastTouched: new Date(),
  zaposleni: [],
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

  const [odjava, setOdjava] = useState(formInitialValues.odjava);
  const handleOdjava = () => {
    setOdjava((prev) => !prev);
  };

  function renderFiled(register, item: Metadata, errors: any) {
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key)}
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          name={item.key}
          defaultValue={formInitialValues[item.key]}
          error={errors[item.key] ? true : false}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.TextMultiline) {
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

    if (item.inputType === InputTypesSchema.enum.Switch) {
      return (
        <FormControlLabel
          sx={{ mx: "auto" }}
          control={
            <Switch
              {...register(item.key)}
              color="error"
              defaultChecked={formInitialValues[item.key]}
              onChange={handleOdjava}
            />
          }
          label={odjava ? "ODJAVLJENI" : "Prijavljeni"}
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
          {...register(item.key)}
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

  const textItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypesSchema.enum.Text)
    .map((item: Metadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const autocompleteItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypesSchema.enum.Select)
    .map((item: Metadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const switchItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypesSchema.enum.Switch)
    .map((item: Metadata) => {
      return (
        <FormControl fullWidth key={item.key}>
          {renderFiled(register, item, errors)}
        </FormControl>
      );
    });

  const textAreaItems = companyFormMetadata
    .filter((element) => element.inputType === InputTypesSchema.enum.TextMultiline)
    .map((item: Metadata) => {
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
