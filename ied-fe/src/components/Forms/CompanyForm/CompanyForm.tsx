import {
  FormControl,
  TextField,
  InputAdornment,
  Button,
  Autocomplete,
  Divider,
} from "@mui/material";
import { Box } from "@mui/system";
import { useForm, Controller } from "react-hook-form";
import { stanjaFirme, tipoviFirme, velicineFirme } from "../../../fakeData/companyData";
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
  Comment,
} from "@mui/icons-material";

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

    // if (item.inputType === InputTypesSchema.enum.Select) {
    //   let optionsData: string[] = [];
    //   switch (item.key) {
    //     case "tip_firme":
    //       optionsData = tipoviFirme;
    //       break;
    //     case "velicina":
    //       optionsData = velicineFirme;
    //       break;
    //     // case "stanje":
    //     //   optionsData = stanjaFirme;
    //     //   break;
    //     default:
    //       break;
    //   }

    //   // return (
    //   //   <Controller
    //   //     name={item.key as "tip_firme" | "velicina"} // | stanje
    //   //     control={control}
    //   //     render={({ field }) => {
    //   //       const { onChange } = field;
    //   //       return (
    //   //         <Autocomplete
    //   //           {...register(item.key as keyof Company)} // TODO: fix this
    //   //           options={optionsData}
    //   //           defaultValue={company[item.key as keyof Company]}
    //   //           renderInput={(params) => {
    //   //             return (
    //   //               <TextField
    //   //                 {...params}
    //   //                 label={item.label}
    //   //                 variant="outlined"
    //   //                 InputProps={{
    //   //                   ...params.InputProps,
    //   //                   startAdornment: (
    //   //                     <>
    //   //                       <InputAdornment position="end" sx={{ m: 1 }}>
    //   //                         {item.inputAdornment}
    //   //                       </InputAdornment>
    //   //                       {params.InputProps.startAdornment}
    //   //                     </>
    //   //                   ),
    //   //                 }}
    //   //               />
    //   //             );
    //   //           }}
    //   //           onChange={(_event, newValue) => {
    //   //             onChange(newValue);
    //   //           }}
    //   //         />
    //   //       );
    //   //     }}
    //   //   ></Controller>
    //   // );
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
        <Divider sx={{ width: "100%", my: 2 }} />{" "}
      </Grid2>
    </Box>
  );
};
